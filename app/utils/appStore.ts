// App Store identifiers for the iOS app. Each one must be created with the
// exact same ID in App Store Connect (and the products/entitlement in RevenueCat).

// The website's "Get the app" links. On since 1.1 was approved (21 Oct 2026); false
// makes the website say "coming soon" instead.
export const APP_STORE_LIVE = true
export const APP_STORE_URL = 'https://apps.apple.com/app/id6819602707'

export const PRO_ENTITLEMENT = 'pro'

// App Store Connect "Product ID" values (permanent once created). The
// footballdle_* names are each product's Reference Name there.
export const PRODUCT_IDS = {
	pro: 'pro', // footballdle_pro
	hint1: 'fh1', // footballdle_hint_1
	hints5: 'fh5', // footballdle_hint_5
	hints15: 'fh15', // footballdle_hint_15
	tipSmall: 'fts', // footballdle_tip_small (Small Tip)
	tipMedium: 'ftm', // footballdle_tip_medium (Medium Tip)
	tipLarge: 'ftl', // footballdle_tip_large (Large Tip)
} as const

// Theme Library (1.2, utils/themes.ts): non-consumables, £0.99 each; the Colour Pack is
// one £2.99 purchase for six plain colour themes. Pro unlocks every theme. Reference
// names: footballdle_theme_<key> (footballdle_theme_colour_pack for the pack).
export const THEME_PRODUCT_IDS = {
	retro: 'theme_retro',
	chalk: 'theme_chalk',
	sunday: 'theme_sunday',
	night: 'theme_night',
	golden: 'theme_golden',
	programme: 'theme_programme',
	colourPack: 'theme_colours',
} as const

export const TIP_PRODUCT_IDS =[PRODUCT_IDS.tipSmall, PRODUCT_IDS.tipMedium, PRODUCT_IDS.tipLarge]

// Consumable hint packs: how many hints each product adds to the player's bank
export const HINT_PACKS = [
	{ id: PRODUCT_IDS.hint1, count: 1 },
	{ id: PRODUCT_IDS.hints5, count: 5 },
	{ id: PRODUCT_IDS.hints15, count: 15 },
]

// App Store Connect "Leaderboard ID" values (locked once created). The
// footballdle.* names are the leaderboards' Reference Names there.
export const LEADERBOARD_IDS = {
	dailyStreak: '1', // footballdle.daily.best_streak
	scoutStreak: '2', // footballdle.scout.best_streak
	spotballStreak: '3', // footballdle.spotball.best_streak
	totalWins: '4', // footballdle.total_wins
} as const

// The Grid's weekly leaderboard (footballdle.grid.week): a *recurring* Game Center
// leaderboard for the week's points, best score, 0-4,500. It restarts every 7 days from
// Sat 17 Oct 2026 00:00 GMT, so midnight UK in winter and 1am in summer (Game Center
// doesn't follow BST); scores sent in that summer hour count towards the week before.
export const GRID_WEEK_LEADERBOARD = '5'
