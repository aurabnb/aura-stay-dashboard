import React from "react"
import { useWallets } from "../hooks/useWallets"
import WalletCard from "./WalletCard"

const MonitoredWallets: React.FC = () => {
  const { wallets, loading, error } = useWallets()

  if (loading) return <div>Loading monitored wallets…</div>
  if (error) return <div className="text-red-600">{error}</div>

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {wallets.map((w) => (
        <WalletCard key={w.wallet_id} wallet={w} />
      ))}
    </div>
  )
}

export default MonitoredWallets
