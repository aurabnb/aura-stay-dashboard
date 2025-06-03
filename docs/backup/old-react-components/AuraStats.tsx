import React from "react"
import { Users, MapPin, Target, RefreshCw, LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSocialMetrics } from "@/hooks/useSocialMetrics"

/* ----------------------- tiny helpers ----------------------- */
const fmt = (n: number) =>
  n >= 1e6
    ? `${+(n / 1e6).toFixed(1)}M`
    : n >= 1e3
    ? `${+(n / 1e3).toFixed(1)}K`
    : n

const StatCard: React.FC<{
  icon: LucideIcon
  title: string
  value: string | number
  note: string
  href?: string
  loading?: boolean
  error?: boolean
  dark?: boolean
}> = ({ icon: Icon, title, value, note, href, loading, error, dark }) => (
  <Card
    className={`border-none shadow-lg hover:shadow-xl transition-shadow ${
      dark ? "bg-black text-white" : ""
    }`}
  >
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-2">{title}</p>
          <div className="flex items-center gap-2 mb-1">
            {loading ? (
              <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
            ) : (
              <span
                className={`text-2xl font-bold ${
                  error ? "text-red-500" : dark ? "text-white" : "text-gray-900"
                }`}
              >
                {value}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">{note}</p>
          {href && (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-700 hover:text-black mt-1 inline-block underline"
            >
              Visit →
            </a>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            dark ? "bg-gray-800" : "bg-gray-50"
          }`}
        >
          <Icon
            className={`w-6 h-6 ${dark ? "text-white" : "text-gray-700"}`}
          />
        </div>
      </div>
    </CardContent>
  </Card>
)

/* ------------------------- main widget ------------------------- */
const AuraStats: React.FC = () => {
  const { metrics, refreshMetrics, isLoading } = useSocialMetrics()

  const socials = [
    {
      title: "X (Twitter) Followers",
      val: metrics.twitter.error
        ? "Check Live"
        : fmt(metrics.twitter.followers ?? 0),
      note: "@Aura_bnb",
      href: "https://x.com/Aura_bnb",
      load: metrics.twitter.isLoading,
      err: !!metrics.twitter.error,
    },
    {
      title: "Telegram Members",
      val: metrics.telegram.error
        ? "Check Live"
        : fmt(metrics.telegram.members ?? 0),
      note: "Community group",
      href: "https://t.me/+_3_OC0_hoY5mYWE5",
      load: metrics.telegram.isLoading,
      err: !!metrics.telegram.error,
    },
    {
      title: "LinkedIn Followers",
      val: metrics.linkedin.error
        ? "Check Live"
        : fmt(metrics.linkedin.followers ?? 0),
      note: "Company page",
      href: "https://www.linkedin.com/company/aura-bnb/",
      load: metrics.linkedin.isLoading,
      err: !!metrics.linkedin.error,
    },
  ]

  return (
    <div className="space-y-8">
      {/* community metrics */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Community Growth</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshMetrics}
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading && "animate-spin"}`} />
            Refresh
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {socials.map((s) => (
            <StatCard
              key={s.title}
              icon={Users}
              title={s.title}
              value={s.val}
              note={s.note}
              href={s.href}
              loading={s.load}
              error={s.err}
            />
          ))}
        </div>
      </div>

      {/* project metrics */}
      <div>
        <h3 className="font-semibold text-lg mb-4">Project Progress</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <StatCard
            icon={MapPin}
            title="Properties in Pipeline"
            value="1"
            note="Eco-stay planned"
          />
          <StatCard
            icon={Target}
            title="Growth Target"
            value="15"
            note="Properties by Year 1"
            dark
          />
        </div>
      </div>
    </div>
  )
}

export default AuraStats
