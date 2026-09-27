import { useState, useEffect, useCallback } from 'react'
import CustomSelect from '../common/CustomSelect'
import { fetchAllYuvakNames, fetchPointsLogs } from '../../services/api'

export default function PointsLogTab() {
  const [karyakartas, setKaryakartas] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedYuvakId, setSelectedYuvakId] = useState('')
  const [filterType, setFilterType] = useState('all')

  const loadData = useCallback(async () => {
    setLoading(true)
    const typeParam = filterType === 'all' ? '' : filterType
    const logsData = await fetchPointsLogs(typeParam, selectedYuvakId, 0, 50)

    if (logsData && logsData.content) {
      setLogs(
        logsData.content.map((item) => ({
          id: item.id,
          karyakarta: item.yuvakName,
          type: item.type,
          points: item.points,
          reason: item.reason || '—',
          date: item.loggedDate
            ? new Date(item.loggedDate).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : '—',
        }))
      )
    } else {
      setLogs([])
    }

    setLoading(false)
  }, [filterType, selectedYuvakId])

  useEffect(() => {
    const loadKaryakartas = async () => {
      const names = await fetchAllYuvakNames()
      setKaryakartas(names)
    }
    loadKaryakartas()
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const karyakartaOptions = karyakartas.map((k) => ({
    value: k.id || k.value || k.fullName,
    label: k.fullName || k.name || k.label,
  }))

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="font-serif text-lg sm:text-xl text-maroon-900 font-semibold">Points Log</h2>
          <p className="mt-0.5 text-xs sm:text-sm text-gray-500">
            Increment and decrement history for karyakartas &amp; yuvaks
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-52">
            <CustomSelect
              value={selectedYuvakId}
              onChange={(e) => setSelectedYuvakId(e.target.value)}
              options={karyakartaOptions}
              placeholder="All karyakartas"
            />
          </div>
          <div className="w-full sm:w-44">
            <CustomSelect
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              options={[
                { value: 'all', label: 'All entries' },
                { value: 'increment', label: 'Increment' },
                { value: 'decrement', label: 'Decrement' },
              ]}
              placeholder="All entries"
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gold-300/40 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">Loading points logs...</div>
        ) : (
          <>
            {/* MOBILE LOG CARDS (Phone screens < sm) */}
            <div className="block sm:hidden divide-y divide-gray-100">
              {logs.map((log) => (
                <div key={log.id} className="p-4 space-y-1.5 hover:bg-sandal-50/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                      <span className="text-gold-500 text-xs">&#9670;</span>
                      {log.karyakarta}
                    </p>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        log.type === 'increment' ? 'bg-peacock-100 text-peacock-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {log.type === 'increment' ? `+${log.points}` : `-${log.points}`} pts
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-0.5">
                    <span>Reason: <span className="text-gray-700 font-medium">{log.reason}</span></span>
                    <span className="shrink-0">{log.date}</span>
                  </div>
                </div>
              ))}

              {logs.length === 0 && (
                <div className="p-8 text-center text-sm text-gray-500">
                  No log entries found.
                </div>
              )}
            </div>

            {/* DESKTOP TABLE VIEW (Screens >= sm) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gold-200/50 bg-sandal-50 text-[11px] uppercase tracking-[0.16em] text-sandal-500">
                    <th className="px-5 py-3 font-semibold">Karyakarta / Yuvak</th>
                    <th className="px-5 py-3 font-semibold">Points</th>
                    <th className="px-5 py-3 font-semibold">Reason</th>
                    <th className="px-5 py-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-gray-100 last:border-0 hover:bg-sandal-50/50 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-medium text-gray-900">{log.karyakarta}</td>
                      <td
                        className={`px-5 py-3.5 font-semibold ${
                          log.type === 'increment' ? 'text-peacock-700' : 'text-rose-700'
                        }`}
                      >
                        {log.type === 'increment' ? `+${log.points}` : `-${log.points}`}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">{log.reason}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-gray-600">{log.date}</td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-gray-500">
                        No log entries found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}