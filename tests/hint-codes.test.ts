import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { usePurchasesStore } from '../app/stores/purchases'
import { HINT_PACKS } from '../app/utils/appStore'

const storage = new Map<string, string>()
globalThis.localStorage = {
	getItem: (k: string) => storage.get(k) ?? null,
	setItem: (k: string, v: string) => void storage.set(k, v),
	removeItem: (k: string) => void storage.delete(k),
	clear: () => storage.clear(),
	key: () => null,
	length: 0,
} as Storage
vi.stubGlobal('useRuntimeConfig', () => ({ public: { isApp: true, appShell: true, revenuecatAppleKey: '' } }))

const NOW = new Date('2026-10-22T12:00:00Z')
const pack = HINT_PACKS[0]!
const tx = (id: string, daysAgo: number) => ({
	transactionIdentifier: id,
	productIdentifier: pack.id,
	purchaseDate: new Date(NOW.getTime() - daysAgo * 86400000).toISOString(),
})
const info = (txs: ReturnType<typeof tx>[]) => ({ nonSubscriptionTransactions: txs }) as never

describe('hint packs from offer codes', () => {
	beforeEach(() => {
		storage.clear()
		vi.useFakeTimers()
		vi.setSystemTime(NOW)
		setActivePinia(createPinia())
	})

	it('a code redeemed before the app was first opened is credited on first launch', () => {
		const store = usePurchasesStore()
		const before = store.hintBank
		expect(store.creditHintPurchases(info([tx('fresh', 0.1)]))).toBe(pack.count)
		expect(store.hintBank).toBe(before + pack.count)
	})

	it('old packs on first launch are only recorded (credited when bought, or in the iCloud backup)', () => {
		const store = usePurchasesStore()
		expect(store.creditHintPurchases(info([tx('old', 30)]))).toBe(0)
	})

	it('never credits the same code twice', () => {
		const store = usePurchasesStore()
		store.creditHintPurchases(info([tx('fresh', 0.1)]))
		expect(store.creditHintPurchases(info([tx('fresh', 0.1)]))).toBe(0)
		// a code redeemed while the app is in use, later on
		expect(store.creditHintPurchases(info([tx('fresh', 0.1), tx('later', 0)]))).toBe(pack.count)
	})
})
