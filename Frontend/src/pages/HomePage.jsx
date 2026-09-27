import { useEffect, useRef, useState } from 'react'
import DashboardTab from '../components/tabs/DashboardTab'
import AttendanceTab from '../components/tabs/AttendanceTab'
import RegistrationTab from '../components/tabs/RegistrationTab'
import KaryakartaTab from '../components/tabs/KaryakartaTab'
import PointsLogTab from '../components/tabs/PointsLogTab'
import TeamsTab from '../components/tabs/TeamsTab'

const tabs = [
  { id: 'dashboard', label: 'Dashboard', component: DashboardTab },
  { id: 'attendance', label: 'Attendance', component: AttendanceTab },
  { id: 'registration', label: 'Registration', component: RegistrationTab },
  { id: 'karyakarta', label: 'Karyakarta', component: KaryakartaTab },
  { id: 'points-log', label: 'Points Log', component: PointsLogTab },
  { id: 'teams', label: 'Teams', component: TeamsTab },
]

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const ActiveComponent = tabs.find((tab) => tab.id === activeTab).component
  const activeTabLabel = tabs.find((tab) => tab.id === activeTab).label

  useEffect(() => {
    if (!menuOpen) return

    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen])

  const selectTab = (tabId) => {
    setActiveTab(tabId)
    setMenuOpen(false)
  }

  const tabButtonClass = (tabId) =>
    `shrink-0 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all touch-manipulation active:scale-95 ${
      activeTab === tabId
        ? 'bg-gradient-to-b from-indigo-500 to-indigo-700 text-white shadow-md'
        : 'text-sandal-600 hover:bg-white hover:text-maroon-800'
    }`

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <h1 className="font-serif text-2xl sm:text-3xl tracking-wide text-maroon-900 font-semibold">
          BalSabha Command Centre
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-gray-500">
          Manage karyakartas, take attendance, track registrations, and overview activity.
        </p>
      </div>

      <div ref={menuRef} className="relative sm:hidden">
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-expanded={menuOpen}
          aria-haspopup="true"
          className="flex w-full items-center justify-between gap-3 rounded-xl border border-gold-300/50 bg-sandal-50 px-4 py-3 shadow-inner touch-manipulation active:scale-[0.99]"
        >
          <span className="flex items-center gap-2.5">
            <svg className="h-5 w-5 text-maroon-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
            <span className="font-serif text-base font-semibold text-maroon-900">{activeTabLabel}</span>
          </span>
          <svg
            className={`h-4 w-4 shrink-0 text-sandal-600 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {menuOpen && (
          <div className="absolute inset-x-0 top-full z-40 mt-2 grid grid-cols-2 gap-1.5 rounded-xl border border-gold-300/50 bg-sandal-50 p-1.5 shadow-xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => selectTab(tab.id)}
                className={`w-full rounded-lg px-3 py-2.5 text-center text-sm font-semibold transition-all touch-manipulation active:scale-95 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-b from-indigo-500 to-indigo-700 text-white shadow-md'
                    : 'text-sandal-600 hover:bg-white hover:text-maroon-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="hidden overflow-x-auto no-scrollbar gap-1.5 rounded-xl border border-gold-300/50 bg-sandal-50 p-1.5 shadow-inner sm:flex sm:w-fit scroll-smooth">
        {tabs.map((tab) => (
          <button key={tab.id} type="button" onClick={() => selectTab(tab.id)} className={tabButtonClass(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <ActiveComponent />
      </div>
    </div>
  )
}