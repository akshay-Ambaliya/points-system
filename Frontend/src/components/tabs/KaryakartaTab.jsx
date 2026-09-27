import { useState, useEffect } from 'react'
import CustomSelect from '../common/CustomSelect'
import { fetchAllYuvakNames, addPointsLog } from '../../services/api'

const inputClass =
  'mt-1 block w-full rounded-xl border border-gold-300/60 bg-white px-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20'

export default function KaryakartaTab() {
  const [members, setMembers] = useState([])
  const [actionKaryakartaId, setActionKaryakartaId] = useState('')
  const [pointsInput, setPointsInput] = useState('')
  const [reasonInput, setReasonInput] = useState('')
  const [audits, setAudits] = useState([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const loadMembers = async () => {
      const data = await fetchAllYuvakNames()
      setMembers(data)
    }
    loadMembers()
  }, [])

  const applyPoints = async (type) => {
    const points = Number(pointsInput)
    if (!actionKaryakartaId || !points || points <= 0) return

    const selectedYuvak = members.find((m) => String(m.id || m.value) === String(actionKaryakartaId))
    const yuvakName = selectedYuvak ? (selectedYuvak.fullName || selectedYuvak.label || selectedYuvak.name) : 'Yuvak'

    setSubmitting(true)
    try {
      await addPointsLog({
        yuvakId: Number(actionKaryakartaId),
        points,
        type,
        reason: reasonInput,
      })

      setAudits((prev) => [
        {
          id: Date.now(),
          karyakarta: yuvakName,
          type,
          points,
          reason: reasonInput,
          date: new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
        },
        ...prev,
      ])

      setPointsInput('')
      setReasonInput('')
    } catch (err) {
      console.error('Failed to apply points log:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const selectOptions = members.map((m) => ({
    value: m.id || m.value || m.fullName,
    label: m.fullName || m.name || m.label,
  }))

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gold-300/40 bg-white shadow-sm">
        <div className="rounded-t-xl border-b border-gold-200/50 bg-gradient-to-r from-sandal-50 to-white px-6 py-4">
          <h3 className="font-serif text-xl text-maroon-900">Points Action</h3>
          <p className="mt-0.5 text-sm text-gray-500">
            Increase or reduce points for a selected karyakarta / yuvak
          </p>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-end">
            <div>
              <label htmlFor="actionKaryakarta" className="block text-xs sm:text-sm font-medium text-gray-700">
                Karyakarta / Yuvak *
              </label>
              <div className="mt-1">
                <CustomSelect
                  id="actionKaryakarta"
                  name="actionKaryakarta"
                  value={actionKaryakartaId}
                  onChange={(e) => setActionKaryakartaId(e.target.value)}
                  options={selectOptions}
                  placeholder={members.length === 0 ? 'No yuvaks available' : 'Select karyakarta / yuvak...'}
                  disabled={members.length === 0}
                />
              </div>
            </div>
            <div>
              <label htmlFor="pointsInput" className="block text-xs sm:text-sm font-medium text-gray-700">
                Points *
              </label>
              <input
                id="pointsInput"
                type="number"
                min="1"
                value={pointsInput}
                onChange={(e) => setPointsInput(e.target.value)}
                className={inputClass}
                placeholder="e.g. 10"
              />
            </div>
            <div>
              <label htmlFor="reasonInput" className="block text-xs sm:text-sm font-medium text-gray-700">
                Reason
              </label>
              <input
                id="reasonInput"
                type="text"
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                className={inputClass}
                placeholder="e.g. Best seva, late attendance..."
              />
            </div>
            <div className="flex items-center gap-2 pt-1 sm:pt-0">
              <button
                type="button"
                disabled={submitting || !actionKaryakartaId}
                onClick={() => applyPoints('increment')}
                className="flex-1 rounded-xl bg-gradient-to-b from-peacock-500 to-peacock-700 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-peacock-600 hover:to-peacock-800 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-center min-h-[42px]"
              >
                + Increase
              </button>
              <button
                type="button"
                disabled={submitting || !actionKaryakartaId}
                onClick={() => applyPoints('decrement')}
                className="flex-1 rounded-xl bg-gradient-to-b from-rose-500 to-rose-700 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-rose-600 hover:to-rose-800 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-center min-h-[42px]"
              >
                &minus; Reduce
              </button>
            </div>
          </div>

          {audits.length > 0 && (
            <div className="mt-6 overflow-hidden rounded-xl border border-gold-300/40">
              {/* MOBILE CARDS FOR AUDIT (Phone screens < sm) */}
              <div className="block sm:hidden divide-y divide-gray-100 bg-white">
                {audits.map((audit) => (
                  <div key={audit.id} className="p-3.5 space-y-1 hover:bg-sandal-50/40 transition-colors">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900 text-sm">{audit.karyakarta}</p>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          audit.type === 'increment' ? 'bg-peacock-100 text-peacock-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {audit.type === 'increment' ? `+${audit.points}` : `-${audit.points}`} pts
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-0.5">
                      <span>Reason: <span className="text-gray-700 font-medium">{audit.reason || '—'}</span></span>
                      <span>{audit.date}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* DESKTOP TABLE FOR AUDIT (Screens >= sm) */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gold-200/50 bg-sandal-50 text-[11px] uppercase tracking-[0.16em] text-sandal-500">
                      <th className="px-4 py-2.5 font-semibold">Karyakarta / Yuvak</th>
                      <th className="px-4 py-2.5 font-semibold">Change</th>
                      <th className="px-4 py-2.5 font-semibold">Reason</th>
                      <th className="px-4 py-2.5 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {audits.map((audit) => (
                      <tr key={audit.id} className="border-b border-gray-100 last:border-0">
                        <td className="px-4 py-2.5 font-medium text-gray-900">{audit.karyakarta}</td>
                        <td
                          className={`px-4 py-2.5 font-semibold ${
                            audit.type === 'increment' ? 'text-peacock-700' : 'text-rose-700'
                          }`}
                        >
                          {audit.type === 'increment' ? `+${audit.points}` : `-${audit.points}`}
                        </td>
                        <td className="px-4 py-2.5 text-gray-600">{audit.reason || '—'}</td>
                        <td className="px-4 py-2.5 text-gray-600">{audit.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}