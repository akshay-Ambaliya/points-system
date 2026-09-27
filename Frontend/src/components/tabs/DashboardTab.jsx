import { useState, useEffect } from 'react'
import { fetchTeams } from '../../services/api'

const gradients = [
  'from-indigo-500 to-amber-400',
  'from-emerald-500 to-peacock-400',
  'from-amber-400 to-gold-500',
  'from-rose-500 to-amber-400',
  'from-sandal-500 to-gold-400',
  'from-peacock-500 to-emerald-400',
]

export default function DashboardTab() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true)
      const data = await fetchTeams()
      setTeams(data)
      setLoading(false)
    }
    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="rounded-xl border border-gold-300/40 bg-white p-8 text-center text-sm text-gray-500">
        Loading dashboard data...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {teams.length > 0 ? (
        <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {teams.map((team, index) => {
            const leaderName = team.leader ? team.leader.fullName : team.teamName || 'Unassigned'
            const memberCount = team.yuvaks ? team.yuvaks.length : 0
            const totalPoints = team.points || 0

            return (
              <div
                key={team.id || index}
                className="group relative overflow-hidden rounded-xl border border-gold-300/40 bg-white p-4 sm:p-6 shadow-sm transition-all hover:shadow-md active:scale-[0.99]"
              >
                <div
                  className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${gradients[index % gradients.length]}`}
                />
                <p className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold uppercase tracking-[0.14em] text-sandal-500">
                  <span className="text-gold-500">&#9670;</span> {team.teamName || leaderName}
                </p>
                <p className="mt-1.5 sm:mt-2 font-serif text-3xl sm:text-5xl font-semibold text-maroon-900">
                  {totalPoints.toLocaleString()}
                </p>
                <p className="mt-1.5 text-xs sm:text-sm text-gray-500">
                  Leader: <span className="font-medium text-gray-700">{leaderName}</span> &middot; {memberCount} members
                </p>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-gold-300/40 bg-white p-12 text-center text-gray-500 shadow-sm">
          <span className="text-3xl text-gold-500" aria-hidden="true">
            &#9670;
          </span>
          <h3 className="mt-2 font-serif text-xl font-semibold text-maroon-900">
            No Dashboard Data Available
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Start by adding teams and registering Yuvaks in their respective tabs.
          </p>
        </div>
      )}
    </div>
  )
}