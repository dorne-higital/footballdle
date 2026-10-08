import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import cardsData from '../data/cards.json'
import { getPuzzleNumber } from '../composables/useFootballers'
import { readSavedObject } from '../utils/storage'
import { usePurchasesStore } from './purchases'

// Player Cards (iOS app): win a Daily in a card season to collect that player's card;
// completing a club's set pays hints into the shared bank. Seasons, sets and which card
// each day gives come from app/data/cards.json (yarn update-players --card-season=…).
export interface CardInfo {
	name: string
	surname: string
	club: string
	nationality: string
	position: string
}
interface Season {
	start: string
	end: string
	startPuzzle: number
	endPuzzle: number
	clubs: Record<string, { size: number; hints: number; members: string[] }>
	cards: Record<string, CardInfo>
	days: string[]
}
export interface OwnedCard {
	id: string
	season: string
	puzzle: number
	guesses: number
	/** Won in 2 guesses or fewer */
	foil: boolean
	replay?: boolean
}
interface SavedCards {
	v: 1
	/** By date (DD/MM/YYYY): the card that day's win gave */
	cards: Record<string, OwnedCard>
	/** `${season}|${club}` -> when the set was finished and what it paid */
	sets: Record<string, { completedOn: string; hints: number }>
	/** Every Daily finished, win or lose, so a reset can't replay a lost day for its card */
	played: Record<string, true>
}

const STORAGE_KEY = 'footballdle-cards'
const FOIL_MAX_GUESSES = 2
const seasons = (cardsData as { seasons: Record<string, Season> }).seasons

/** The card season a date falls in, and the card that day gives (if any) */
export function cardForDay(dateStr: string): { season: string; id: string; card: CardInfo } | null {
	const puzzle = getPuzzleNumber(dateStr)
	for (const [label, s] of Object.entries(seasons)) {
		if (puzzle < s.startPuzzle || puzzle > s.endPuzzle) continue
		const id = s.days[puzzle - s.startPuzzle]
		const card = id ? s.cards[id] : undefined
		return id && card ? { season: label, id, card } : null
	}
	return null
}

export const useCardsStore = defineStore('cards', () => {
	const { isApp } = useRuntimeConfig().public
	const saved = ref<SavedCards>({ v: 1, cards: {}, sets: {}, played: {} })
	/** What the latest win gave, for the result sheet */
	const lastAward = ref<{ card: CardInfo; owned: OwnedCard; isNew: boolean; club: string; have: number; size: number; setHints: number } | null>(null)
	let loaded = false

	function load() {
		if (loaded || !import.meta.client) return
		loaded = true
		const s = readSavedObject<SavedCards>(STORAGE_KEY)
		saved.value = {
			v: 1,
			cards: s?.cards && typeof s.cards === 'object' ? s.cards : {},
			sets: s?.sets && typeof s.sets === 'object' ? s.sets : {},
			played: s?.played && typeof s.played === 'object' ? s.played : {},
		}
	}

	function persist() {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(saved.value))
		} catch {}
	}

	/** Distinct card ids owned in a season */
	function ownedIds(season: string): Set<string> {
		return new Set(Object.values(saved.value.cards).filter(c => c.season === season).map(c => c.id))
	}

	function clubProgress(season: string, club: string) {
		const set = seasons[season]?.clubs[club]
		if (!set) return { have: 0, size: 0, hints: 0 }
		const owned = ownedIds(season)
		return { have: set.members.filter(m => owned.has(m)).length, size: set.size, hints: set.hints }
	}

	/** A finished Daily: records it as played and, if won in a card season, gives the card
	 *  (once per day) and pays any set it completes. Safe to call again for the same day. */
	function finishDaily(dateStr: string, won: boolean, guesses: number) {
		if (!isApp) return
		load()
		const today = cardForDay(dateStr)
		const alreadyPlayed = !!saved.value.played[dateStr]
		const existing = saved.value.cards[dateStr]
		saved.value.played[dateStr] = true
		if (!today || !won || existing || (alreadyPlayed && !existing)) {
			persist()
			if (today && existing) showAward(today, existing, false)
			return
		}
		const before = ownedIds(today.season).has(today.id)
		const owned: OwnedCard = {
			id: today.id,
			season: today.season,
			puzzle: getPuzzleNumber(dateStr),
			guesses,
			foil: guesses <= FOIL_MAX_GUESSES,
		}
		saved.value.cards[dateStr] = owned
		const paid = payCompletedSet(today.season, today.card.club, dateStr)
		persist()
		showAward(today, owned, !before, paid)
	}

	function payCompletedSet(season: string, club: string, dateStr: string): number {
		const key = `${season}|${club}`
		const { have, size, hints } = clubProgress(season, club)
		if (!size || have < size || saved.value.sets[key]) return 0
		saved.value.sets[key] = { completedOn: dateStr, hints }
		usePurchasesStore().grantHints(hints)
		return hints
	}

	function showAward(today: NonNullable<ReturnType<typeof cardForDay>>, owned: OwnedCard, isNew: boolean, paid = 0) {
		const { have, size } = clubProgress(today.season, today.card.club)
		lastAward.value = { card: today.card, owned, isNew, club: today.card.club, have, size, setHints: paid }
	}

	const totalOwned = computed(() => new Set(Object.values(saved.value.cards).map(c => `${c.season}|${c.id}`)).size)

	return { saved, lastAward, totalOwned, load, finishDaily, clubProgress, ownedIds, seasons }
})
