import { Outlet } from 'react-router-dom'
import logo from '../assets/logo.jpg'

export default function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="relative bg-gradient-to-r from-maroon-950 via-maroon-800 to-maroon-950 shadow-lg">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold-400/80 to-transparent" />
        <div className="mx-auto flex max-w-6xl items-center justify-between px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <img
              src={logo}
              alt="BalSabha logo"
              className="h-9 w-9 sm:h-11 sm:w-11 rounded-full border border-gold-400/70 object-cover shrink-0"
            />
            <div>
              <p className="font-serif text-lg sm:text-xl tracking-wide text-gold-100 font-medium">
                BalSabha
              </p>
              <p className="text-[9px] sm:text-[11px] font-medium uppercase tracking-[0.24em] sm:tracking-[0.28em] text-gold-400/90">
                Hari Prabodham
              </p>
            </div>
          </div>
          <span className="hidden items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-gold-200/70 sm:flex">
            {['Seva', 'Smruti', 'Suhradbhav', 'Swadharma'].map((word, index) => (
              <span key={word} className="flex items-center gap-2">
                {index > 0 && (
                  <span aria-hidden="true" className="text-gold-400/60">
                    |
                  </span>
                )}
                {word}
              </span>
            ))}
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-3 py-4 sm:px-4 sm:py-8">
        <Outlet />
      </main>

      <footer className="border-t-2 border-gold-400/30 bg-maroon-950 py-4 sm:py-5 text-center px-3">
        <p className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.20em] sm:tracking-[0.24em] text-gold-400/80">
          BalSabha Hari Prabodham &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  )
}