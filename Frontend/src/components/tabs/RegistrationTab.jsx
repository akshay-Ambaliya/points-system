import { fetchRegisteredYuvaks, fetchInactiveYuvaks, registerYuvak, updateYuvak, deleteYuvak, reactivateYuvak } from '../../services/api'
import { useState, useEffect, useCallback } from 'react'
const emptyForm = {
  fullName: '',
  phone: '',
  email: '',
  address: '',
  remarks: '',
}

const formatDateTime = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatPoints = (points) => (points == null ? '' : String(points))

export default function RegistrationTab() {
  const [yuvaks, setYuvaks] = useState([])
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Pagination & Search States (Active Yuvaks)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  // Pagination & Search States (Inactive Yuvaks)
  const [inactiveYuvaks, setInactiveYuvaks] = useState([])
  const [inactiveTotalElements, setInactiveTotalElements] = useState(0)
  const [inactiveTotalPages, setInactiveTotalPages] = useState(1)
  const [inactiveLoading, setInactiveLoading] = useState(true)
  const [inactiveSearch, setInactiveSearch] = useState('')
  const [inactiveCurrentPage, setInactiveCurrentPage] = useState(1)
  const [inactivePageSize, setInactivePageSize] = useState(5)

  // View Details Modal
  const [viewingYuvak, setViewingYuvak] = useState(null)

  // Edit Yuvak Modal
  const [editingYuvak, setEditingYuvak] = useState(null)
  const [editForm, setEditForm] = useState({ ...emptyForm })
  const [savingEdit, setSavingEdit] = useState(false)

  // Delete / Inactivate Yuvak Modal
  const [deletingYuvak, setDeletingYuvak] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Reactivate Yuvak Modal
  const [reactivatingYuvakObj, setReactivatingYuvakObj] = useState(null)
  const [reactivating, setReactivating] = useState(false)

  const loadYuvaks = useCallback(async () => {
    setLoading(true)
    const pageData = await fetchRegisteredYuvaks(search, currentPage - 1, pageSize)
    if (pageData && pageData.content) {
      setYuvaks(pageData.content)
      setTotalElements(pageData.totalElements || pageData.content.length)
      setTotalPages(pageData.totalPages || 1)
    } else {
      setYuvaks([])
      setTotalElements(0)
      setTotalPages(1)
    }
    setLoading(false)
  }, [search, currentPage, pageSize])

  const loadInactiveYuvaks = useCallback(async () => {
    setInactiveLoading(true)
    const pageData = await fetchInactiveYuvaks(inactiveSearch, inactiveCurrentPage - 1, inactivePageSize)
    if (pageData && pageData.content) {
      setInactiveYuvaks(pageData.content)
      setInactiveTotalElements(pageData.totalElements || pageData.content.length)
      setInactiveTotalPages(pageData.totalPages || 1)
    } else {
      setInactiveYuvaks([])
      setInactiveTotalElements(0)
      setInactiveTotalPages(1)
    }
    setInactiveLoading(false)
  }, [inactiveSearch, inactiveCurrentPage, inactivePageSize])

  useEffect(() => {
    loadYuvaks()
  }, [loadYuvaks])

  useEffect(() => {
    loadInactiveYuvaks()
  }, [loadInactiveYuvaks])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.fullName) return

    setSubmitting(true)
    try {
      await registerYuvak({
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
        address: form.address,
        remarks: form.remarks,
      })
      setSubmitted(true)
      loadYuvaks()
    } catch (err) {
      console.error('Registration failed:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  const openEditModal = (yuvak) => {
    setEditForm({
      fullName: yuvak.fullName || '',
      phone: yuvak.phone || '',
      email: yuvak.email || '',
      address: yuvak.address || '',
      remarks: yuvak.remarks || '',
    })
    setEditingYuvak(yuvak)
  }

  const handleEditChange = (event) => {
    const { name, value } = event.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditSubmit = async (event) => {
    event.preventDefault()
    if (!editingYuvak || !editForm.fullName) return

    setSavingEdit(true)
    try {
      await updateYuvak(editingYuvak.id, {
        fullName: editForm.fullName,
        phone: editForm.phone,
        email: editForm.email,
        address: editForm.address,
        remarks: editForm.remarks,
      })
      setEditingYuvak(null)
      loadYuvaks()
    } catch (err) {
      console.error('Failed to update yuvak:', err)
    } finally {
      setSavingEdit(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingYuvak) return
    setDeleting(true)
    try {
      await deleteYuvak(deletingYuvak.id)
      setDeletingYuvak(null)
      loadYuvaks()
      loadInactiveYuvaks()
    } catch (err) {
      console.error('Failed to inactivate yuvak:', err)
    } finally {
      setDeleting(false)
    }
  }

  const handleReactivateConfirm = async () => {
    if (!reactivatingYuvakObj) return
    setReactivating(true)
    try {
      await reactivateYuvak(reactivatingYuvakObj.id)
      setReactivatingYuvakObj(null)
      loadYuvaks()
      loadInactiveYuvaks()
    } catch (err) {
      console.error('Failed to reactivate yuvak:', err)
    } finally {
      setReactivating(false)
    }
  }

  const inputClass =
    'mt-1 block w-full rounded-xl border border-gold-300/60 bg-white px-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20'

  return (
    <div className="space-y-8">
      {/* 1. REGISTRATION FORM SECTION */}
      <div className="mx-auto max-w-3xl">
        <h2 className="font-serif text-xl text-maroon-900">
          New Yuvak Registration
        </h2>
        <p className="text-sm text-gray-500">
          Register a new Yuvak into the Hari Prabodham. Automatically awards +100 points!
        </p>

        {submitted ? (
          <div className="mt-6 rounded-xl border border-peacock-300/70 bg-peacock-50 p-8 text-center shadow-sm">
            <span className="text-3xl text-peacock-600" aria-hidden="true">
              &#10022;
            </span>
            <p className="mt-2 font-serif text-2xl text-peacock-800">
              Registration submitted
            </p>
            <p className="mt-1 text-sm text-peacock-700">
              {form.fullName} has been registered successfully and received +100 welcome points.
            </p>
            <button
              type="button"
              onClick={() => {
                setForm(emptyForm)
                setSubmitted(false)
              }}
              className="mt-5 rounded-xl bg-gradient-to-b from-indigo-500 to-indigo-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:from-indigo-600 hover:to-indigo-800"
            >
              Register another
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-4 rounded-xl border border-gold-300/40 bg-white p-6 shadow-sm"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Full name *
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  required
                  value={form.fullName}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Full Name"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="10-digit mobile number"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={2}
                  value={form.address}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="House / street / area"
                />
              </div>
            </div>

            <div>
              <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">
                Remarks
              </label>
              <textarea
                id="remarks"
                name="remarks"
                rows={2}
                value={form.remarks}
                onChange={handleChange}
                className={inputClass}
                placeholder="Notes or additional information"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-gradient-to-b from-indigo-500 to-indigo-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:from-indigo-600 hover:to-indigo-800 disabled:opacity-50 sm:w-auto"
            >
              {submitting ? 'Submitting...' : 'Submit registration'}
            </button>
          </form>
        )}
      </div>

      {/* 2. PAGINATED REGISTERED YUVAKS TABLE & MOBILE CARDS */}
      <div className="rounded-xl border border-gold-300/40 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gold-200/50 bg-gradient-to-r from-sandal-50 to-white px-4 py-3.5 sm:px-6 sm:py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h3 className="font-serif text-lg sm:text-xl text-maroon-900 font-semibold">Registered Yuvaks Directory</h3>
            <p className="mt-0.5 text-xs sm:text-sm text-gray-500">
              Total {totalElements} registered yuvak(s)
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
            <div className="flex items-center justify-between sm:justify-start gap-2 text-xs text-gray-600 bg-sandal-50/70 p-2 sm:p-0 rounded-lg sm:bg-transparent">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="rounded-lg border border-gold-300/60 bg-white px-2 py-1 text-xs text-gray-800 focus:border-indigo-500 focus:outline-none"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>per page</span>
            </div>
            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="Search name, phone, email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full rounded-xl border border-gold-300/60 bg-white px-3.5 py-2 sm:py-1.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
        </div>

        {/* MOBILE CARD VIEW (Phone screens < md) */}
        <div className="block md:hidden">
          {loading ? (
            <div className="p-8 text-center text-sm text-gray-500">Loading registered yuvaks...</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {yuvaks.map((yuvak, index) => (
                <div key={yuvak.id || index} className="p-4 space-y-2 hover:bg-sandal-50/30 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-semibold text-sandal-600 uppercase tracking-wider">
                        #{(currentPage - 1) * pageSize + index + 1}
                      </span>
                      <h4 className="font-semibold text-gray-900 text-base flex items-center gap-1.5 mt-0.5">
                        <span className="text-gold-500 text-xs">&#9670;</span>
                        {yuvak.fullName}
                      </h4>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        title="View Details"
                        onClick={() => setViewingYuvak(yuvak)}
                        className="rounded-lg p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition active:scale-95"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        title="Edit Details"
                        onClick={() => openEditModal(yuvak)}
                        className="rounded-lg p-2 text-gold-700 bg-gold-100/60 hover:bg-gold-200/60 transition active:scale-95"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        title="Inactivate Yuvak"
                        onClick={() => setDeletingYuvak(yuvak)}
                        className="rounded-lg p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 transition active:scale-95"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>                  <div className="grid grid-cols-1 gap-1 text-xs text-gray-600 pt-1">
                    <div className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-sandal-100/60 border border-gold-200/50 mb-1">
                      <span className="font-semibold text-sandal-700">Total Points:</span>
                      <span className="font-bold text-maroon-900 text-sm">
                        {(yuvak.points ?? 0).toLocaleString()} pts
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700 min-w-14">Phone:</span>
                      <a href={`tel:${yuvak.phone}`} className="text-indigo-600 font-medium hover:underline">
                        {yuvak.phone}
                      </a>
                    </div>
                    {yuvak.email && (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700 min-w-14">Email:</span>
                        <span className="truncate">{yuvak.email}</span>
                      </div>
                    )}
                    {yuvak.address && (
                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-gray-700 min-w-14 shrink-0">Address:</span>
                        <span>{yuvak.address}</span>
                      </div>
                    )}
                    {yuvak.remarks && (
                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-gray-700 min-w-14 shrink-0">Remarks:</span>
                        <span className="italic text-gray-500">{yuvak.remarks}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {yuvaks.length === 0 && (
                <div className="p-8 text-center text-sm text-gray-500">
                  No registered yuvaks found in the database.
                </div>
              )}
            </div>
          )}
        </div>

        {/* DESKTOP TABLE VIEW (Screens >= md) */}
        <div className="hidden md:block overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-sm text-gray-500">Loading registered yuvaks...</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gold-200/50 bg-sandal-50 text-[11px] uppercase tracking-[0.16em] text-sandal-500">
                  <th className="px-6 py-3.5 font-semibold">#</th>
                  <th className="px-6 py-3.5 font-semibold">Full Name</th>
                  <th className="px-6 py-3.5 font-semibold">Phone</th>
                  <th className="px-6 py-3.5 font-semibold">Total Points</th>
                  <th className="px-6 py-3.5 font-semibold">Email</th>
                  <th className="px-6 py-3.5 font-semibold">Address</th>
                  <th className="px-6 py-3.5 font-semibold">Remarks</th>
                  <th className="px-6 py-3.5 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {yuvaks.map((yuvak, index) => (
                  <tr
                    key={yuvak.id || index}
                    className="border-b border-gray-100 last:border-0 hover:bg-sandal-50/40 transition-colors"
                  >
                    <td className="px-6 py-4 text-xs text-gray-400 font-medium">
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900 flex items-center gap-2">
                      <span className="text-gold-500 text-xs" aria-hidden="true">&#9670;</span>
                      {yuvak.fullName}
                    </td>
                    <td className="px-6 py-4 text-gray-700 font-medium">{yuvak.phone}</td>
                    <td className="px-6 py-4 font-bold text-maroon-900">
                      <span className="inline-flex items-center rounded-full bg-sandal-100/80 px-2.5 py-1 text-xs font-bold text-maroon-900 border border-gold-300/50">
                        {(yuvak.points ?? 0).toLocaleString()} pts
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{yuvak.email || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{yuvak.address || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{yuvak.remarks || '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          title="View Yuvak Details"
                          onClick={() => setViewingYuvak(yuvak)}
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
                        <button
                          type="button"
                          title="Edit Yuvak Details"
                          onClick={() => openEditModal(yuvak)}
                          className="inline-flex items-center justify-center rounded-lg p-2 text-gold-600 hover:bg-gold-50 hover:text-maroon-800 transition active:scale-95"
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
                              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          title="Inactivate Yuvak"
                          onClick={() => setDeletingYuvak(yuvak)}
                          className="inline-flex items-center justify-center rounded-lg p-2 text-rose-600 hover:bg-rose-50 hover:text-rose-800 transition active:scale-95"
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
                              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {yuvaks.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      No registered yuvaks found in the database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* PAGINATION CONTROLS */}
        <div className="border-t border-gold-200/50 bg-sandal-50/50 px-4 py-3 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500 text-center sm:text-left">
            Showing <span className="font-semibold text-gray-700">{totalElements === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-semibold text-gray-700">{Math.min(currentPage * pageSize, totalElements)}</span> of{' '}
            <span className="font-semibold text-gray-700">{totalElements}</span> entries
          </p>

          {/* MOBILE COMPACT PAGINATION */}
          <div className="flex sm:hidden items-center gap-2 w-full justify-between">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-center"
            >
              &larr; Prev
            </button>
            <span className="text-xs font-semibold text-gray-700 px-2">
              {currentPage} / {totalPages || 1}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => handlePageChange(currentPage + 1)}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-center"
            >
              Next &rarr;
            </button>
          </div>

          {/* DESKTOP PAGINATION */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(1)}
              className="rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              title="First Page"
            >
              &laquo; First
            </button>

            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex items-center gap-1 text-xs">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => handlePageChange(page)}
                  className={`h-7 w-7 rounded-lg text-xs font-medium transition ${page === currentPage
                    ? 'bg-gradient-to-b from-indigo-500 to-indigo-700 text-white shadow-sm'
                    : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => handlePageChange(currentPage + 1)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>

            <button
              type="button"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => handlePageChange(totalPages)}
              className="rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Last Page"
            >
              Last &raquo;
            </button>
          </div>
        </div>
      </div>

      {/* 3. PAGINATED INACTIVE YUVAKS TABLE & MOBILE CARDS */}
      <div className="rounded-xl border border-rose-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-rose-200/60 bg-gradient-to-r from-rose-50/60 to-white px-4 py-3.5 sm:px-6 sm:py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h3 className="font-serif text-lg sm:text-xl text-maroon-900 font-semibold flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
              Inactive Yuvaks Directory
            </h3>
            <p className="mt-0.5 text-xs sm:text-sm text-gray-500">
              Total {inactiveTotalElements} inactive yuvak(s)
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
            <div className="flex items-center justify-between sm:justify-start gap-2 text-xs text-gray-600 bg-rose-50/70 p-2 sm:p-0 rounded-lg sm:bg-transparent">
              <span>Show</span>
              <select
                value={inactivePageSize}
                onChange={(e) => {
                  setInactivePageSize(Number(e.target.value))
                  setInactiveCurrentPage(1)
                }}
                className="rounded-lg border border-rose-300/60 bg-white px-2 py-1 text-xs text-gray-800 focus:border-rose-500 focus:outline-none"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>per page</span>
            </div>
            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="Search inactive yuvaks..."
                value={inactiveSearch}
                onChange={(e) => {
                  setInactiveSearch(e.target.value)
                  setInactiveCurrentPage(1)
                }}
                className="w-full rounded-xl border border-rose-300/60 bg-white px-3.5 py-2 sm:py-1.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>
          </div>
        </div>

        {/* MOBILE CARD VIEW (Phone screens < md) */}
        <div className="block md:hidden">
          {inactiveLoading ? (
            <div className="p-8 text-center text-sm text-gray-500">Loading inactive yuvaks...</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {inactiveYuvaks.map((yuvak, index) => (
                <div key={yuvak.id || index} className="p-4 space-y-2 bg-rose-50/20 hover:bg-rose-50/40 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-semibold text-rose-500 uppercase tracking-wider">
                        #{(inactiveCurrentPage - 1) * inactivePageSize + index + 1} · Inactive
                      </span>
                      <h4 className="font-semibold text-gray-700 text-base flex items-center gap-1.5 mt-0.5 line-through">
                        {yuvak.fullName}
                      </h4>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        title="View Details"
                        onClick={() => setViewingYuvak(yuvak)}
                        className="rounded-lg p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition active:scale-95"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => setReactivatingYuvakObj(yuvak)}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition active:scale-95 flex items-center gap-1"
                      >
                        <span>Re-activate</span>
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-1 text-xs text-gray-600 pt-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700 min-w-14">Phone:</span>
                      <span>{yuvak.phone}</span>
                    </div>
                    {yuvak.email && (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700 min-w-14">Email:</span>
                        <span className="truncate">{yuvak.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {inactiveYuvaks.length === 0 && (
                <div className="p-8 text-center text-sm text-gray-500">
                  No inactive yuvaks found.
                </div>
              )}
            </div>
          )}
        </div>

        {/* DESKTOP TABLE VIEW (Screens >= md) */}
        <div className="hidden md:block overflow-x-auto">
          {inactiveLoading ? (
            <div className="p-8 text-center text-sm text-gray-500">Loading inactive yuvaks...</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-rose-200/60 bg-rose-50/50 text-[11px] uppercase tracking-[0.16em] text-rose-700">
                  <th className="px-6 py-3.5 font-semibold">#</th>
                  <th className="px-6 py-3.5 font-semibold">Full Name</th>
                  <th className="px-6 py-3.5 font-semibold">Phone</th>
                  <th className="px-6 py-3.5 font-semibold">Total Points</th>
                  <th className="px-6 py-3.5 font-semibold">Email</th>
                  <th className="px-6 py-3.5 font-semibold">Status</th>
                  <th className="px-6 py-3.5 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {inactiveYuvaks.map((yuvak, index) => (
                  <tr
                    key={yuvak.id || index}
                    className="border-b border-gray-100 last:border-0 bg-gray-50/30 hover:bg-rose-50/20 transition-colors"
                  >
                    <td className="px-6 py-4 text-xs text-gray-400 font-medium">
                      {(inactiveCurrentPage - 1) * inactivePageSize + index + 1}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-600 line-through">
                      {yuvak.fullName}
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{yuvak.phone}</td>
                    <td className="px-6 py-4 font-bold text-gray-500">
                      {(yuvak.points ?? 0).toLocaleString()} pts
                    </td>
                    <td className="px-6 py-4 text-gray-500">{yuvak.email || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200">
                        Inactive
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          title="View Yuvak Details"
                          onClick={() => setViewingYuvak(yuvak)}
                          className="inline-flex items-center justify-center rounded-lg p-2 text-indigo-600 hover:bg-indigo-50 transition active:scale-95"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => setReactivatingYuvakObj(yuvak)}
                          className="inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition active:scale-95 shadow-sm"
                        >
                          Re-activate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {inactiveYuvaks.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No inactive yuvaks found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* INACTIVE PAGINATION CONTROLS */}
        <div className="border-t border-rose-200/60 bg-rose-50/30 px-4 py-3 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500 text-center sm:text-left">
            Showing <span className="font-semibold text-gray-700">{inactiveTotalElements === 0 ? 0 : (inactiveCurrentPage - 1) * inactivePageSize + 1}</span> to{' '}
            <span className="font-semibold text-gray-700">{Math.min(inactiveCurrentPage * inactivePageSize, inactiveTotalElements)}</span> of{' '}
            <span className="font-semibold text-gray-700">{inactiveTotalElements}</span> inactive entries
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={inactiveCurrentPage === 1}
              onClick={() => setInactiveCurrentPage(1)}
              className="rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              &laquo; First
            </button>
            <button
              type="button"
              disabled={inactiveCurrentPage === 1}
              onClick={() => setInactiveCurrentPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-xs font-medium text-gray-700 px-2">
              Page {inactiveCurrentPage} of {inactiveTotalPages || 1}
            </span>
            <button
              type="button"
              disabled={inactiveCurrentPage === inactiveTotalPages || inactiveTotalPages === 0}
              onClick={() => setInactiveCurrentPage((p) => Math.min(inactiveTotalPages, p + 1))}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
            <button
              type="button"
              disabled={inactiveCurrentPage === inactiveTotalPages || inactiveTotalPages === 0}
              onClick={() => setInactiveCurrentPage(inactiveTotalPages)}
              className="rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Last &raquo;
            </button>
          </div>
        </div>
      </div>

      {/* YUVAK DETAILS POPUP MODAL */}
      {viewingYuvak && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-maroon-950/60 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-gold-300/50 bg-white p-5 sm:p-6 shadow-2xl space-y-4 sm:space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-gold-500" aria-hidden="true">&#9670;</span>
                  <h3 className="font-serif text-lg sm:text-xl text-maroon-900 font-bold">{viewingYuvak.fullName}</h3>
                </div>
                <p className="mt-0.5 text-xs text-gray-500">
                  Yuvak ID: <span className="font-medium text-gray-700">#{viewingYuvak.id}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingYuvak(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1 rounded-lg hover:bg-gray-100 transition"
              >
                &times;
              </button>
            </div>

            {/* Total Points Highlight Card */}
            <div className="flex items-center justify-between rounded-xl border border-gold-300/60 bg-gradient-to-r from-sandal-100/90 via-gold-50 to-sandal-50 px-4 py-3 shadow-sm">
              <div>
                <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-sandal-700 block">
                  Total Points Earned
                </span>
                <span className="text-2xl sm:text-3xl font-serif font-bold text-maroon-900">
                  {(viewingYuvak.points ?? 0).toLocaleString()} <span className="text-sm font-sans font-semibold text-maroon-700">pts</span>
                </span>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gold-400/20 border border-gold-400/50 flex items-center justify-center text-gold-600 text-xl sm:text-2xl font-bold shadow-inner">
                &#9733;
              </div>
            </div>

            {/* Detail Fields */}
            <div className="space-y-2.5 sm:space-y-3">
              {[
                { label: 'Phone', value: viewingYuvak.phone },
                { label: 'Email', value: viewingYuvak.email },
                { label: 'Address', value: viewingYuvak.address },
                { label: 'Remarks', value: viewingYuvak.remarks },
                { label: 'Registered On', value: formatDateTime(viewingYuvak.createdAt) },
                { label: 'Last Updated', value: formatDateTime(viewingYuvak.updatedAt) },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-0.5 rounded-xl border border-gold-200/40 bg-sandal-50/40 px-3.5 py-2.5 sm:px-4 sm:py-3">
                  <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-sandal-500">
                    {label}
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-gray-800 break-words">
                    {value || '—'}
                  </span>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setViewingYuvak(null)}
                className="w-full sm:w-auto rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition text-center"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT YUVAK POPUP MODAL */}
      {editingYuvak && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-maroon-950/60 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-gold-300/50 bg-white p-5 sm:p-6 shadow-2xl space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-gold-500" aria-hidden="true">&#9670;</span>
                  <h3 className="font-serif text-lg sm:text-xl text-maroon-900 font-bold">Edit Yuvak</h3>
                </div>
                <p className="mt-0.5 text-xs text-gray-500">
                  Updating profile of{' '}
                  <span className="font-medium text-gray-700">#{editingYuvak.id} · {editingYuvak.fullName}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingYuvak(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1 rounded-lg hover:bg-gray-100 transition"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                <div>
                  <label htmlFor="editFullName" className="block text-xs sm:text-sm font-medium text-gray-700">
                    Full name *
                  </label>
                  <input
                    id="editFullName"
                    name="fullName"
                    required
                    value={editForm.fullName}
                    onChange={handleEditChange}
                    className={inputClass}
                    placeholder="Full Name"
                  />
                </div>
                <div>
                  <label htmlFor="editPhone" className="block text-xs sm:text-sm font-medium text-gray-700">
                    Phone *
                  </label>
                  <input
                    id="editPhone"
                    name="phone"
                    type="tel"
                    required
                    value={editForm.phone}
                    onChange={handleEditChange}
                    className={inputClass}
                    placeholder="10-digit mobile number"
                  />
                </div>
                <div>
                  <label htmlFor="editEmail" className="block text-xs sm:text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    id="editEmail"
                    name="email"
                    type="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                    className={inputClass}
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="editAddress" className="block text-xs sm:text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <textarea
                    id="editAddress"
                    name="address"
                    rows={2}
                    value={editForm.address}
                    onChange={handleEditChange}
                    className={inputClass}
                    placeholder="House / street / area"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="editRemarks" className="block text-xs sm:text-sm font-medium text-gray-700">
                  Remarks
                </label>
                <textarea
                  id="editRemarks"
                  name="remarks"
                  rows={2}
                  value={editForm.remarks}
                  onChange={handleEditChange}
                  className={inputClass}
                  placeholder="Notes or additional information"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingYuvak(null)}
                  className="w-full sm:w-auto rounded-xl border border-gray-300 px-4 py-2.5 sm:py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="w-full sm:w-auto rounded-xl bg-gradient-to-b from-indigo-500 to-indigo-700 px-5 py-2.5 sm:py-2 text-sm font-medium text-white shadow-sm transition hover:from-indigo-600 hover:to-indigo-800 disabled:opacity-50 text-center"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE / INACTIVATE CONFIRMATION MODAL */}
      {deletingYuvak && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-maroon-950/60 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl border border-rose-300/50 bg-white p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-rose-700">
              <svg className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <h3 className="font-serif text-lg sm:text-xl text-maroon-900 font-bold">
                Inactivate Yuvak?
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-gray-600">
              Are you sure you want to inactivate <span className="font-bold text-gray-900">{deletingYuvak.fullName}</span>? This Yuvak will be marked as inactive and removed from active lists.
            </p>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setDeletingYuvak(null)}
                className="w-full sm:w-auto rounded-xl border border-gray-300 px-4 py-2.5 sm:py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteConfirm}
                className="w-full sm:w-auto rounded-xl bg-gradient-to-b from-rose-600 to-rose-800 px-5 py-2.5 sm:py-2 text-sm font-medium text-white shadow-sm transition hover:from-rose-700 hover:to-rose-900 disabled:opacity-50 text-center"
              >
                {deleting ? 'Inactivating...' : 'Yes, Inactivate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REACTIVATE CONFIRMATION MODAL */}
      {reactivatingYuvakObj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-maroon-950/60 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl border border-emerald-300/50 bg-white p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-emerald-700">
              <svg className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-serif text-lg sm:text-xl text-maroon-900 font-bold">
                Re-activate Yuvak?
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-gray-600">
              Are you sure you want to re-activate <span className="font-bold text-gray-900">{reactivatingYuvakObj.fullName}</span>? This Yuvak will be moved back to the active directory and available across Attendance and Teams.
            </p>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setReactivatingYuvakObj(null)}
                className="w-full sm:w-auto rounded-xl border border-gray-300 px-4 py-2.5 sm:py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={reactivating}
                onClick={handleReactivateConfirm}
                className="w-full sm:w-auto rounded-xl bg-gradient-to-b from-emerald-600 to-emerald-800 px-5 py-2.5 sm:py-2 text-sm font-medium text-white shadow-sm transition hover:from-emerald-700 hover:to-emerald-900 disabled:opacity-50 text-center"
              >
                {reactivating ? 'Re-activating...' : 'Yes, Re-activate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}