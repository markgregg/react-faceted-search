export default interface Interest {
  client: string
  side: 'BUY' | 'SELL'
  sector?: string
  isin?: string
  size?: number
  couponFrom?: number
  couponTo?: number
  maturityDateFrom?: string
  maturityDateTo?: string
}
