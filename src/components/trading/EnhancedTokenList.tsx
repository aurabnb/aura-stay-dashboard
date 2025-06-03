'use client'

import React from 'react'
import TokenList from './TokenList'

interface Token {
  symbol: string
  name: string
  price: number
  change24h: number
  volume24h: number
  marketCap: number
  icon: string
  jupiterUrl?: string
  priceChange7d?: number
  liquidity?: number
  isVerified?: boolean
  holders?: number
}

interface EnhancedTokenListProps {
  tokens: Token[]
  selectedToken: string
  onTokenSelect: (symbol: string) => void
  showAll?: boolean
}

const EnhancedTokenList: React.FC<EnhancedTokenListProps> = (props) => {
  // For now, just use the basic TokenList with enhanced styling
  return <TokenList {...props} />
}

export default EnhancedTokenList
export { EnhancedTokenList } 