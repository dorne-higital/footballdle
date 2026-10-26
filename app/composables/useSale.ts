import { saleFor, type SaleConfig } from '../utils/sale'

// The flash-sale label for a product, from the sale in app-config.json (app-config plugin)
export function useSale() {
	const sale = useState<SaleConfig | null>('store-sale', () => null)
	return (product?: { identifier: string; price: number; currencyCode: string }) => saleFor(product, sale.value)
}
