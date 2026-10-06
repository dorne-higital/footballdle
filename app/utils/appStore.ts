// App Store identifiers for the iOS app. Each one must be created with the
// exact same ID in App Store Connect (and the products/entitlement in RevenueCat).

export const PRO_ENTITLEMENT = 'pro'

export const PRODUCT_IDS = {
	pro: 'footballdle_pro',
	hint1: 'footballdle_hint_1',
	hints5: 'footballdle_hints_5',
	hints15: 'footballdle_hints_15',
	tipSmall: 'footballdle_tip_small',
	tipMedium: 'footballdle_tip_medium',
	tipLarge: 'footballdle_tip_large',
} as const

export const TIP_PRODUCT_IDS = [PRODUCT_IDS.tipSmall, PRODUCT_IDS.tipMedium, PRODUCT_IDS.tipLarge]

// Consumable hint packs: how many hints each product adds to the player's bank
export const HINT_PACKS = [
	{ id: PRODUCT_IDS.hint1, count: 1 },
	{ id: PRODUCT_IDS.hints5, count: 5 },
	{ id: PRODUCT_IDS.hints15, count: 15 },
]

export const LEADERBOARD_IDS = {
	dailyStreak: 'footballdle.daily.best_streak',
	scoutStreak: 'footballdle.scout.best_streak',
	spotballStreak: 'footballdle.spotball.best_streak',
	totalWins: 'footballdle.total_wins',
} as const
