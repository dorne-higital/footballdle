// Writes app-store/ACHIEVEMENTS.md from app/utils/achievements.ts, so the App Store
// Connect checklist never drifts from the code. Run: yarn achievements-md (vite-node, because app code imports without file extensions)
import { writeFileSync } from 'node:fs'
import { ACHIEVEMENT_GROUPS, ACHIEVEMENTS, TOTAL_ACHIEVEMENT_POINTS } from '../app/utils/achievements'

const cell = (s: string) => s.replace(/\|/g, '\\|')

const lines = [
	'# Game Center achievements',
	'',
	'Generated from `app/utils/achievements.ts` by `yarn achievements-md`. Don\'t edit by hand.',
	'',
	'Every Achievement ID must exist in App Store Connect with these points. Badge images are `app-store/achievements/<id>.jpg` (1024×1024).',
	'',
	`${ACHIEVEMENTS.length} achievements, ${TOTAL_ACHIEVEMENT_POINTS} / 1000 points. Tiers: bronze 5, silver 15, gold 25, emerald 35.`,
	'',
	'The Grid\'s trophies keep the `fd_challenge_` IDs of the Challenge trophies they replaced, because Game Center IDs can\'t be deleted.',
]

for (const group of ACHIEVEMENT_GROUPS) {
	const points = group.achievements.reduce((n, a) => n + a.points, 0)
	lines.push(
		'',
		`## ${group.title} (${group.achievements.length}, ${points} points)`,
		'',
		'| Achievement ID | Title | Points | Hidden | Pre-earned description | Earned description |',
		'|---|---|---|---|---|---|',
		...group.achievements.map(a =>
			`| \`${a.id}\` | ${cell(a.title)} | ${a.points} | ${a.hidden ? 'yes' : 'no'} | ${cell(a.goal)} | ${cell(a.earned)} |`),
	)
}

const grouped = ACHIEVEMENT_GROUPS.reduce((n, g) => n + g.achievements.length, 0)
if (grouped !== ACHIEVEMENTS.length) throw new Error(`${ACHIEVEMENTS.length - grouped} achievements are in no group`)

writeFileSync(new URL('../app-store/ACHIEVEMENTS.md', import.meta.url), lines.join('\n') + '\n')
console.log(`Wrote ${ACHIEVEMENTS.length} achievements, ${TOTAL_ACHIEVEMENT_POINTS} points`)
