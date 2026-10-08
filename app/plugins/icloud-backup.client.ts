import { Capacitor, registerPlugin } from '@capacitor/core'
import { watch } from 'vue'
import { useCardsStore } from '../stores/cards'
import { useClimbStore } from '../stores/climb'
import { usePurchasesStore } from '../stores/purchases'

// Backs up Player Cards, The Climb and the hint bank to iCloud (ios/App/App/ICloudBackupPlugin.swift),
// so a deleted app or a new iPhone gets them back. Until the app has the iCloud key-value
// capability the native store never syncs, so all of this quietly does nothing.
interface ICloudBackupPlugin {
	get(options: { key: string }): Promise<{ value?: string }>
	set(options: { key: string; value: string }): Promise<void>
	addListener(event: 'changed', fn: (data: { initial?: boolean }) => void): Promise<unknown>
}
const ICloudBackup = registerPlugin<ICloudBackupPlugin>('ICloudBackup')

const CARDS = 'cards'
const CLIMB = 'climb'
const HINTS = 'hints'
const PUSH_DELAY_MS = 1500

export default defineNuxtPlugin(() => {
	if (!Capacitor.isNativePlatform()) return
	const cards = useCardsStore()
	const purchases = usePurchasesStore()
	const climb = useClimbStore()
	cards.load()
	climb.load()

	async function read(key: string): Promise<string | undefined> {
		try {
			return (await ICloudBackup.get({ key })).value
		} catch {
			return undefined
		}
	}

	// Cards only ever grow, so they merge both ways. The hint bank is a running total that
	// can't be merged, so a backup only ever raises it (fresh install or new phone), and it's
	// only written when it changes here, after launch, never on launch itself: that way a
	// fresh install's welcome hints can't overwrite a bigger bank still downloading.
	async function pull() {
		cards.mergeBackup(await read(CARDS))
		climb.mergeBackup(await read(CLIMB))
		const hints = Number.parseInt((await read(HINTS)) ?? '', 10)
		if (Number.isFinite(hints)) purchases.restoreHintBank(hints)
	}

	let timer: ReturnType<typeof setTimeout> | undefined
	const pending = new Set<string>()
	function push(key: string) {
		pending.add(key)
		clearTimeout(timer)
		timer = setTimeout(() => {
			for (const k of pending) {
				const value = k === CARDS ? JSON.stringify(cards.saved) : k === CLIMB ? JSON.stringify(climb.saved) : String(purchases.hintBank)
				ICloudBackup.set({ key: k, value }).catch(() => {})
			}
			pending.clear()
		}, PUSH_DELAY_MS)
	}

	pull().finally(() => {
		push(CARDS)
		watch(() => cards.saved, () => push(CARDS), { deep: true })
		watch(() => climb.saved, () => push(CLIMB), { deep: true })
		watch(() => purchases.hintBank, () => push(HINTS))
	})
	ICloudBackup.addListener('changed', () => {
		pull()
	}).catch(() => {})
})
