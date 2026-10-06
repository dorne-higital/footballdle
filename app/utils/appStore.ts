// App Store identifiers for the iOS app. Each one must be created with the
// exact same ID in App Store Connect (and the products/entitlement in RevenueCat).

export const PRO_ENTITLEMENT = 'pro'

// App Store Connect "Product ID" values (permanent once created). The
// footballdle_* names are each product's Reference Name there.
export const PRODUCT_IDS = {
	pro: 'pro', // footballdle_pro
	hint1: 'fh1', // footballdle_hint_1
	hints5: 'fh5', // footballdle_hint_5
	hints15: 'fh15', // footballdle_hint_15
	tipSmall: 'fts', // footballdle_tip_small (Orange Slices)
	tipMedium: 'ftm', // footballdle_tip_medium (Half-Time Pie)
	tipLarge: 'ftl', // footballdle_tip_large (Matchday Programme)
} as const

export const TIP_PRODUCT_IDS = [PRODUCT_IDS.tipSmall, PRODUCT_IDS.tipMedium, PRODUCT_IDS.tipLarge]

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
