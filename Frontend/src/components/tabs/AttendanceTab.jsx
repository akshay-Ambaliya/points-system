import { useState, useEffect, useCallback } from 'react'
import { fetchAttendanceStatus, updateAttendanceLog } from '../../services/api'

export default function AttendanceTab() {
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().split('T')[0]
  )
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [pendingId, setPendingId] = useState(null)
  
  // Checkbox states for modal
  const [isUniformed, setIsUniformed] = useState(true)
  const [carryingDiary, setCarryingDiary] = useState(false)

  const loadAttendance = useCallback(async () => {
    setLoading(true)
    const data = await fetchAttendanceStatus(selectedDate)
    const mappedRows = data.map((item) => ({
      id: item.yuvakId,
      name: item.fullName || item.yuvakName || 'Yuvak',
      present: item.present || false,
      uniform: item.uniform,
      carryingDiary: item.carryingDiary,
      logId: item.attendanceLogId || item.logId,
    }))
    setRows(mappedRows)
    setLoading(false)
  }, [selectedDate])

  useEffect(() => {
    loadAttendance()
  }, [loadAttendance])

  const handleCardClick = async (id, present) => {
    if (present) {
      // Mark as absent directly
      setRows((prev) =>
        prev.map((row) => (row.id === id ? { ...row, present: false, uniform: null, carryingDiary: null } : row))
      )
      try {
        await updateAttendanceLog({
          yuvakId: id,
          attendanceDate: selectedDate,
          present: false,
          uniform: null,
          carryingDiary: null,
        })
      } catch (err) {
        console.error('Failed to update attendance:', err)
      }
    } else {
      setPendingId(id)
      setIsUniformed(true)
      setCarryingDiary(false)
    }
  }

  const submitAttendance = async () => {
    if (!pendingId) return

    setRows((prev) =>
      prev.map((row) =>
        row.id === pendingId ? { ...row, present: true, uniform: isUniformed, carryingDiary } : row
      )
    )

    try {
      await updateAttendanceLog({
        yuvakId: pendingId,
        attendanceDate: selectedDate,
        present: true,
        uniform: isUniformed,
        carryingDiary,
      })
    } catch (err) {
      console.error('Failed to update attendance:', err)
    }

    setPendingId(null)
    setIsUniformed(true)
    setCarryingDiary(false)
  }

  const handleMarkAllPresent = async () => {
    setRows((prev) => prev.map((row) => ({ ...row, present: true, uniform: true, carryingDiary: true })))
    for (const row of rows) {
      try {
        await updateAttendanceLog({
          yuvakId: row.id,
          attendanceDate: selectedDate,
          present: true,
          uniform: true,
          carryingDiary: true,
        })
      } catch (err) {
        console.error('Failed to update attendance for yuvak:', row.id, err)
      }
    }
  }

  const filteredRows = rows.filter((row) =>
    (row.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const pendingRow = rows.find((row) => row.id === pendingId)
  const presentCount = rows.filter((row) => row.present).length
  const absentCount = rows.length - presentCount

  const formattedDateHeader = new Date(selectedDate + 'T00:00:00').toLocaleDateString(
    'en-GB',
    { day: 'numeric', month: 'long', year: 'numeric' }
  )

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid gap-3 sm:gap-5 grid-cols-2">
        <div className="group relative overflow-hidden rounded-xl border border-gold-300/40 bg-white p-4 sm:p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-peacock-500 to-emerald-400" />
          <p className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold uppercase tracking-[0.12em] sm:tracking-[0.14em] text-sandal-500">
            <span className="text-gold-500">&#9670;</span> Present
          </p>
          <p className="mt-1 sm:mt-2 font-serif text-3xl sm:text-5xl font-semibold text-maroon-900">{presentCount}</p>
        </div>
        <div className="group relative overflow-hidden rounded-xl border border-gold-300/40 bg-white p-4 sm:p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-rose-500 to-amber-400" />
          <p className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold uppercase tracking-[0.12em] sm:tracking-[0.14em] text-sandal-500">
            <span className="text-gold-500">&#9670;</span> Absent
          </p>
          <p className="mt-1 sm:mt-2 font-serif text-3xl sm:text-5xl font-semibold text-maroon-900">{absentCount}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="font-serif text-lg sm:text-xl text-maroon-900 font-semibold">
            Attendance for {formattedDateHeader}
          </h2>
          <p className="mt-0.5 text-xs sm:text-sm text-gray-500">
            Select each yuvak to mark their attendance
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-52">
            <input
              type="text"
              placeholder="Search yuvak..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gold-300/60 bg-white px-3.5 py-2 text-sm text-gray-800 placeholder:text-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full sm:w-auto rounded-xl border border-gold-300/60 bg-white px-3.5 py-2 text-sm text-gray-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <button
            type="button"
            onClick={handleMarkAllPresent}
            disabled={rows.length === 0}
            className="w-full sm:w-auto rounded-xl border border-gold-400/70 bg-sandal-50 px-4 py-2 text-sm font-medium text-maroon-800 transition hover:bg-sandal-100 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-center active:scale-95"
          >
            Mark all present
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-gold-300/40 bg-white p-8 text-center text-sm text-gray-500">
          Loading attendance data...
        </div>
      ) : (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRows.map((row) => (
            <div
              key={row.id}
              className={`rounded-xl border p-3.5 sm:p-4 shadow-sm transition-colors ${
                row.present
                  ? 'border-peacock-300/70 bg-peacock-50'
                  : 'border-gold-300/40 bg-white hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate text-sm sm:text-base">{row.name}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5 text-xs text-gray-500">
                    {row.present && (
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] sm:text-[11px] font-medium ${
                        row.uniform ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {row.uniform ? 'In uniform' : 'No uniform'}
                      </span>
                    )}
                    {row.present && row.carryingDiary && (
                      <span className="inline-flex items-center rounded-full bg-indigo-100 text-indigo-800 px-2 py-0.5 text-[10px] sm:text-[11px] font-medium">
                        Diary ✓
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCardClick(row.id, row.present)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-95 ${
                    row.present
                      ? 'bg-peacock-600 text-white shadow-sm'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {row.present ? 'Present' : 'Absent'}
                </button>
              </div>
            </div>
          ))}

          {filteredRows.length === 0 && (
            <div className="col-span-full rounded-xl border border-gold-300/40 bg-white p-8 text-center text-sm text-gray-500">
              {rows.length === 0
                ? 'No yuvaks registered in the system yet. Please add yuvaks in the Registration tab.'
                : 'No yuvaks match your search query.'}
            </div>
          )}
        </div>
      )}

      {/* MODAL POPUP ON CLICK OF ABSENT */}
      {pendingRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-maroon-950/60 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-gold-300/50 bg-white p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-gold-500" aria-hidden="true">
                &#9670;
              </span>
              <h3 className="font-serif text-lg sm:text-xl text-maroon-900 font-bold">
                Mark {pendingRow.name} Present?
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">Please verify the following options:</p>

            {/* TWO CHECKBOXES */}
            <div className="space-y-2 rounded-xl border border-gold-200/60 bg-sandal-50/50 p-3 sm:p-4">
              <label className="flex items-center gap-3 cursor-pointer select-none p-2 rounded-lg hover:bg-sandal-100/60 transition">
                <input
                  type="checkbox"
                  checked={isUniformed}
                  onChange={(e) => setIsUniformed(e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-semibold text-gray-800">
                  isUniformed?
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none p-2 rounded-lg hover:bg-sandal-100/60 transition">
                <input
                  type="checkbox"
                  checked={carryingDiary}
                  onChange={(e) => setCarryingDiary(e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-semibold text-gray-800">
                  Carrying Diary?
                </span>
              </label>
            </div>

            <div className="mt-5 flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setPendingId(null)
                  setIsUniformed(true)
                  setCarryingDiary(false)
                }}
                className="w-full sm:w-auto rounded-xl border border-gray-300 px-4 py-2.5 sm:py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitAttendance}
                className="w-full sm:w-auto rounded-xl bg-gradient-to-b from-indigo-500 to-indigo-700 px-5 py-2.5 sm:py-2 text-sm font-medium text-white shadow-sm transition hover:from-indigo-600 hover:to-indigo-800 text-center"
              >
                Submit Attendance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}