import { useState, useRef, useEffect } from 'react'

export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Select an option...',
  id,
  name,
  className = '',
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const containerRef = useRef(null)

  // Normalize options to array of { value, label }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return { value: opt.value ?? opt.id ?? opt.name, label: opt.label ?? opt.name ?? String(opt.value) }
    }
    return { value: opt, label: opt }
  })

  const selectedOption = normalizedOptions.find((opt) => String(opt.value) === String(value))

  const filteredOptions = searchTerm
    ? normalizedOptions.filter((opt) =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : normalizedOptions

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (val) => {
    onChange({ target: { name, value: val } })
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className={`relative inline-block w-full ${className}`}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => {
          setIsOpen((prev) => !prev)
          setSearchTerm('')
        }}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border border-gold-300/70 bg-gradient-to-b from-white to-sandal-50/30 px-3.5 py-2.5 text-left text-sm font-medium text-gray-800 shadow-sm transition-all hover:border-gold-400 hover:shadow-md focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60 ${
          isOpen ? 'border-indigo-500 ring-2 ring-indigo-500/20' : ''
        }`}
      >
        <span className={`block truncate ${!selectedOption ? 'text-gray-400' : 'text-gray-800'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`h-4 w-4 shrink-0 text-gold-600 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full rounded-xl border border-gold-300/60 bg-white/95 p-1.5 shadow-xl backdrop-blur-md transition-all duration-150">
          <div className="p-0.5 pb-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full rounded-lg border border-gold-300/60 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div className="max-h-56 overflow-y-auto no-scrollbar">
            {placeholder && (
              <button
                type="button"
                onClick={() => handleSelect('')}
                className={`flex w-full items-center rounded-lg px-3 py-2.5 text-sm text-gray-400 hover:bg-sandal-50 hover:text-gray-700 active:bg-sandal-100 ${
                  !value ? 'bg-sandal-50 font-semibold text-indigo-700' : ''
                }`}
              >
                {placeholder}
              </button>
            )}
            {filteredOptions.map((opt) => {
              const isSelected = String(opt.value) === String(value)
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors active:scale-[0.99] ${
                    isSelected
                      ? 'bg-gradient-to-r from-sandal-100 to-gold-50 font-semibold text-maroon-900'
                      : 'text-gray-700 hover:bg-sandal-50 hover:text-maroon-900 active:bg-sandal-100'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && (
                    <svg
                      className="h-4 w-4 shrink-0 text-indigo-600 ml-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              )
            })}
            {filteredOptions.length === 0 && (
              <div className="px-3 py-4 text-center text-sm text-gray-400">
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
