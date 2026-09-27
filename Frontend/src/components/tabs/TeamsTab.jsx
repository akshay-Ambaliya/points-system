import { useState, useRef, useEffect, useCallback } from 'react'
import CustomSelect from '../common/CustomSelect'
import { fetchTeams, fetchAllYuvakNames, saveTeam, updateTeam } from '../../services/api'

const emptyForm = {
  name: '',
  leaderId: '',
  memberIds: [],
}

const inputClass =
  'mt-1 block w-full rounded-xl border border-gold-300/60 bg-white px-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20'

export default function TeamsTab() {
  const [teams, setTeams] = useState([])
  const [yuvakList, setYuvakList] = useState([])
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState(emptyForm)
  const [search, setSearch] = useState('')
  const [memberSearch, setMemberSearch] = useState('')
  const [isMemberDropdownOpen, setIsMemberDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Modal State for Team Members View & Add
  const [viewingTeam, setViewingTeam] = useState(null)
  const [selectedModalYuvakId, setSelectedModalYuvakId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    const [fetchedTeams, fetchedYuvaks] = await Promise.all([
      fetchTeams(),
      fetchAllYuvakNames(),
    ])
    setTeams(fetchedTeams)
    setYuvakList(fetchedYuvaks)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMemberDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const toggleMemberSelection = (yuvakId) => {
    setForm((prev) => {
      const isSelected = prev.memberIds.includes(yuvakId)
      if (isSelected) {
        return { ...prev, memberIds: prev.memberIds.filter((id) => id !== yuvakId) }
      } else {
        return { ...prev, memberIds: [...prev.memberIds, yuvakId] }
      }
    })
  }

  const removeMember = (yuvakId) => {
    setForm((prev) => ({
      ...prev,
      memberIds: prev.memberIds.filter((id) => id !== yuvakId),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name) return

    setSubmitting(true)
    try {
      await saveTeam({
        teamName: form.name,
        leaderId: form.leaderId ? Number(form.leaderId) : null,
        yuvakIds: form.memberIds.map(Number),
      })
      setForm(emptyForm)
      loadData()
    } catch (err) {
      console.error('Failed to create team:', err)
    } finally {
      setSubmitting(false)
    }
  }

  // Add new Yuvak to team in modal via dropdown selection
  const handleAddYuvakToTeam = async (e) => {
    e.preventDefault()
    if (!selectedModalYuvakId || !viewingTeam) return

    const newYuvakId = Number(selectedModalYuvakId)
    const existingMemberIds = (viewingTeam.yuvaks || []).map((y) => y.id)
    if (existingMemberIds.includes(newYuvakId)) return

    const updatedYuvakIds = [...existingMemberIds, newYuvakId]

    setSubmitting(true)
    try {
      const updated = await updateTeam(viewingTeam.id, {
        teamName: viewingTeam.teamName,
        leaderId: viewingTeam.leader ? viewingTeam.leader.id : null,
        yuvakIds: updatedYuvakIds,
      })
      setViewingTeam(updated)
      setSelectedModalYuvakId('')
      loadData()
    } catch (err) {
      console.error('Failed to add yuvak to team:', err)
    } finally {
      setSubmitting(false)
    }
  }

  // Remove Yuvak from team in modal
  const handleRemoveYuvakFromTeam = async (yuvakId) => {
    if (!viewingTeam) return

    const updatedYuvakIds = (viewingTeam.yuvaks || [])
      .map((y) => y.id)
      .filter((id) => id !== yuvakId)

    setSubmitting(true)
    try {
      const updated = await updateTeam(viewingTeam.id, {
        teamName: viewingTeam.teamName,
        leaderId: viewingTeam.leader ? viewingTeam.leader.id : null,
        yuvakIds: updatedYuvakIds,
      })
      setViewingTeam(updated)
      loadData()
    } catch (err) {
      console.error('Failed to remove yuvak from team:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const filteredTeams = teams.filter((t) => {
    const nameMatch = (t.teamName || '').toLowerCase().includes(search.toLowerCase())
    const leaderMatch = t.leader && (t.leader.fullName || '').toLowerCase().includes(search.toLowerCase())
    const memberMatch = (t.yuvaks || []).some((m) =>
      (m.fullName || '').toLowerCase().includes(search.toLowerCase())
    )
    return nameMatch || leaderMatch || memberMatch
  })

  // Filter available yuvaks for modal dropdown (excluding members already in viewingTeam)
  const modalAvailableYuvaks = viewingTeam
    ? yuvakList.filter(
        (y) => !(viewingTeam.yuvaks || []).some((member) => member.id === y.id)
      )
    : []

  const yuvakOptionsForSelect = yuvakList.map((y) => ({
    value: y.id,
    label: y.fullName || y.name,
  }))

  // Members list filtered by in-dropdown search box
  const memberSearchResults = memberSearch
    ? yuvakList.filter((y) =>
        (y.fullName || '').toLowerCase().includes(memberSearch.toLowerCase())
      )
    : yuvakList

  return (
    <div className="grid gap-6 lg:grid-cols-12 items-start">
      {/* 1. LEFT SECTION: FORM */}
      <div className="lg:col-span-4 rounded-xl border border-gold-300/40 bg-white shadow-sm">
        <div className="rounded-t-xl border-b border-gold-200/50 bg-gradient-to-r from-sandal-50 to-white px-6 py-4">
          <h2 className="font-serif text-xl text-maroon-900">Add New Team</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Register a new team in the BalSabha system.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div>
            <label htmlFor="teamName" className="block text-xs sm:text-sm font-medium text-gray-700">
              Team Name *
            </label>
            <input
              id="teamName"
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Team Alpha"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="teamLeader" className="block text-xs sm:text-sm font-medium text-gray-700">
              Team Leader
            </label>
            <div className="mt-1">
              <CustomSelect
                id="teamLeader"
                name="leaderId"
                value={form.leaderId}
                onChange={handleChange}
                options={yuvakOptionsForSelect}
                placeholder={yuvakList.length === 0 ? 'No yuvaks available' : 'Select leader...'}
                disabled={yuvakList.length === 0}
              />
            </div>
          </div>

          {/* MULTI-SELECT MEMBERS FIELD */}
          <div ref={dropdownRef} className="relative">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">
              Members ({form.memberIds.length} selected)
            </label>

            {/* Dropdown trigger button */}
            <button
              type="button"
              onClick={() => {
                setIsMemberDropdownOpen((prev) => !prev)
                setMemberSearch('')
              }}
              disabled={yuvakList.length === 0}
              className="mt-1 flex w-full items-center justify-between gap-2 rounded-xl border border-gold-300/70 bg-gradient-to-b from-white to-sandal-50/30 px-3.5 py-2.5 text-left text-sm font-medium text-gray-800 shadow-sm transition-all hover:border-gold-400 hover:shadow-md focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
            >
              <span className={`block truncate ${form.memberIds.length === 0 ? 'text-gray-400' : 'text-gray-800'}`}>
                {form.memberIds.length > 0
                  ? `${form.memberIds.length} member(s) selected`
                  : 'Select members...'}
              </span>
              <svg
                className={`h-4 w-4 shrink-0 text-gold-600 transition-transform duration-200 ${
                  isMemberDropdownOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Selected Member Chips */}
            {form.memberIds.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1">
                {form.memberIds.map((id) => {
                  const yuvak = yuvakList.find((y) => y.id === id)
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-xs font-medium text-indigo-700"
                    >
                      {yuvak ? yuvak.fullName : id}
                      <button
                        type="button"
                        onClick={() => removeMember(id)}
                        className="ml-0.5 hover:text-indigo-900 font-bold"
                      >
                        &times;
                      </button>
                    </span>
                  )
                })}
              </div>
            )}

            {/* Dropdown list of checkboxes */}
            {isMemberDropdownOpen && (
              <div className="absolute z-50 mt-1.5 w-full rounded-xl border border-gold-300/60 bg-white p-2 shadow-xl backdrop-blur-md">
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Search members..."
                  className="mb-1.5 w-full rounded-lg border border-gold-300/60 bg-white px-2.5 py-1.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none"
                />
                <div className="max-h-48 overflow-y-auto no-scrollbar">
                  {memberSearchResults.map((yuvak) => {
                    const isChecked = form.memberIds.includes(yuvak.id)
                    return (
                      <label
                        key={yuvak.id}
                        onClick={() => toggleMemberSelection(yuvak.id)}
                        className={`flex items-center justify-between cursor-pointer rounded-lg px-3 py-2 text-sm transition-colors ${
                          isChecked
                            ? 'bg-sandal-100/70 font-semibold text-maroon-900'
                            : 'text-gray-700 hover:bg-sandal-50'
                        }`}
                      >
                        <span className="truncate">{yuvak.fullName}</span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // Handled by label click
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </label>
                    )
                  })}
                  {memberSearchResults.length === 0 && (
                    <div className="px-3 py-4 text-center text-sm text-gray-400">
                      No members found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setForm(emptyForm)}
              className="w-full sm:w-auto rounded-xl border border-gray-300 px-4 py-2.5 sm:py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition text-center"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto rounded-xl bg-gradient-to-b from-indigo-500 to-indigo-700 px-5 py-2.5 sm:py-2 text-sm font-medium text-white shadow-sm transition hover:from-indigo-600 hover:to-indigo-800 disabled:opacity-50 text-center"
            >
              {submitting ? 'Saving...' : 'Add Team'}
            </button>
          </div>
        </form>
      </div>

      {/* 2. RIGHT SECTION: TABLE & MOBILE CARDS */}
      <div className="lg:col-span-8 rounded-xl border border-gold-300/40 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gold-200/50 bg-gradient-to-r from-sandal-50 to-white px-4 py-3.5 sm:px-6 sm:py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h2 className="font-serif text-lg sm:text-xl text-maroon-900 font-semibold">Teams Directory</h2>
            <p className="mt-0.5 text-xs sm:text-sm text-gray-500">
              List of all active teams
            </p>
          </div>
          <div className="w-full sm:w-56">
            <input
              type="text"
              placeholder="Search team or member..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gold-300/60 bg-white px-3.5 py-2 sm:py-1.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* MOBILE CARD VIEW (Phone screens < md) */}
        <div className="block md:hidden">
          {loading ? (
            <div className="p-8 text-center text-sm text-gray-500">Loading teams...</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredTeams.map((team) => (
                <div key={team.id} className="p-4 space-y-3 hover:bg-sandal-50/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-maroon-900 text-base flex items-center gap-1.5">
                      <span className="text-gold-500 text-xs">&#9670;</span>
                      {team.teamName}
                    </h3>
                    <span className="inline-flex items-center rounded-full bg-maroon-100/70 text-maroon-900 px-3 py-0.5 text-xs font-bold">
                      {(team.points || 0).toLocaleString()} pts
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-600 bg-sandal-50/60 p-2.5 rounded-lg border border-gold-200/40">
                    <div>
                      <span className="text-gray-500">Leader: </span>
                      <span className="font-semibold text-gray-800">{team.leader ? team.leader.fullName : '—'}</span>
                    </div>
                    <div className="font-medium text-gray-700">
                      {team.yuvaks ? team.yuvaks.length : 0} member(s)
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setViewingTeam(team)
                        setSelectedModalYuvakId('')
                      }}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition active:scale-95"
                    >
                      View Team Members &rarr;
                    </button>
                  </div>
                </div>
              ))}

              {filteredTeams.length === 0 && (
                <div className="p-8 text-center text-sm text-gray-500">
                  No teams found matching your search.
                </div>
              )}
            </div>
          )}
        </div>

        {/* DESKTOP TABLE VIEW (Screens >= md) */}
        <div className="hidden md:block overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-sm text-gray-500">Loading teams...</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gold-200/50 bg-sandal-50 text-[11px] uppercase tracking-[0.16em] text-sandal-500">
                  <th className="px-6 py-3.5 font-semibold">Team Name</th>
                  <th className="px-6 py-3.5 font-semibold">Leader</th>
                  <th className="px-6 py-3.5 font-semibold">Team Members</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Total Points</th>
                  <th className="px-6 py-3.5 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeams.map((team) => (
                  <tr
                    key={team.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-sandal-50/40 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-gray-900 flex items-center gap-2">
                      <span className="text-gold-500 text-xs" aria-hidden="true">&#9670;</span>
                      {team.teamName}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-700">
                      {team.leader ? team.leader.fullName : '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-700 font-semibold">
                      {team.yuvaks ? team.yuvaks.length : 0} member(s)
                    </td>
                    <td className="px-6 py-4 font-bold text-maroon-900 text-right">
                      {(team.points || 0).toLocaleString()} pts
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        type="button"
                        title="View Team Members"
                        onClick={() => {
                          setViewingTeam(team)
                          setSelectedModalYuvakId('')
                        }}
                        className="inline-flex items-center justify-center rounded-lg p-2 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-800 transition active:scale-95"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredTeams.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No teams found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* TEAM MEMBERS POPUP MODAL */}
      {viewingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-maroon-950/60 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-gold-300/50 bg-white p-5 sm:p-6 shadow-2xl space-y-4 sm:space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-gold-500" aria-hidden="true">&#9670;</span>
                  <h3 className="font-serif text-lg sm:text-xl text-maroon-900 font-bold">{viewingTeam.teamName}</h3>
                </div>
                <p className="mt-0.5 text-xs text-gray-500">
                  Leader: <span className="font-medium text-gray-700">{viewingTeam.leader ? viewingTeam.leader.fullName : 'N/A'}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setViewingTeam(null)
                  setSelectedModalYuvakId('')
                }}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1 rounded-lg hover:bg-gray-100 transition"
              >
                &times;
              </button>
            </div>

            {/* Form with Dropdown to Add New Yuvak */}
            <form onSubmit={handleAddYuvakToTeam} className="bg-sandal-50/50 p-3 sm:p-3.5 rounded-xl border border-gold-200/50 space-y-2">
              <label className="block text-xs font-semibold text-maroon-900 uppercase tracking-wider">
                Add New Yuvak to {viewingTeam.teamName}
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="w-full">
                  <CustomSelect
                    value={selectedModalYuvakId}
                    onChange={(e) => setSelectedModalYuvakId(e.target.value)}
                    options={modalAvailableYuvaks.map((y) => ({ value: y.id, label: y.fullName }))}
                    placeholder="Select Yuvak to add..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={!selectedModalYuvakId || submitting}
                  className="shrink-0 rounded-xl bg-gradient-to-b from-indigo-500 to-indigo-700 px-4 py-2.5 sm:py-2 text-xs font-semibold text-white shadow-sm transition hover:from-indigo-600 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-center"
                >
                  + Add Yuvak
                </button>
              </div>
            </form>

            {/* List of Team Members */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-800">
                  Current Team Members ({(viewingTeam.yuvaks || []).length})
                </h4>
              </div>

              {(viewingTeam.yuvaks || []).length > 0 ? (
                <div className="max-h-56 overflow-y-auto rounded-xl border border-gray-200 bg-white divide-y divide-gray-100 no-scrollbar">
                  {(viewingTeam.yuvaks || []).map((member, index) => (
                    <div
                      key={member.id || index}
                      className="flex items-center justify-between px-3.5 py-2.5 text-xs sm:text-sm hover:bg-sandal-50/40 transition-colors gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-sandal-100 text-[11px] sm:text-xs font-semibold text-maroon-800 shrink-0">
                          {index + 1}
                        </span>
                        <span className="font-medium text-gray-800 truncate">{member.fullName}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="inline-flex items-center rounded-full bg-sandal-100/90 text-maroon-900 px-2 py-0.5 text-[11px] sm:text-xs font-bold border border-gold-300/50">
                          {(member.points ?? 0).toLocaleString()} pts
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveYuvakFromTeam(member.id)}
                          className="text-xs text-rose-500 hover:text-rose-700 hover:underline p-1"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-xs sm:text-sm text-gray-500">
                  No members assigned to this team yet. Select a Yuvak above!
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setViewingTeam(null)
                  setSelectedModalYuvakId('')
                }}
                className="w-full sm:w-auto rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition text-center"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
