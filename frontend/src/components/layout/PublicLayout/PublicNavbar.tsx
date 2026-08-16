import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'

export default function PublicNavbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Discount', path: '/offers' },
    { name: 'About Us', path: '/about' },
  ]

  return (
    <header
      className={`bg-surface/80 backdrop-blur-md fixed full-width top-0 left-0 right-0 z-50 border-b border-outline-variant shadow-sm transition-all duration-300 ${scrolled ? 'py-2 shadow-md' : 'py-3'}`}
    >
      <nav className="flex justify-between items-center px-6 md:px-12 w-full max-w-7xl mx-auto">
        <Link to="/" className="text-2xl font-black text-[#103e2c] tracking-tight flex items-center gap-1.5 group">
          <span className="w-3 h-3 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
          StockSense
        </Link>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-3 items-center">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path))
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                    isActive
                      ? 'bg-[#103e2c] text-white shadow-[0_4px_18px_rgba(16,62,44,0.4)] border border-emerald-600/30'
                      : 'text-gray-600 hover:bg-emerald-50/90 hover:text-[#103e2c] hover:shadow-[0_4px_16px_rgba(16,62,44,0.2)] hover:border-emerald-200 border border-transparent'
                  }`}
                >
                  {link.name}
                </Link>
              )
            })}
          </div>
          <button
            onClick={() => navigate('/login')}
            className="bg-[#103e2c] text-white px-5 py-2 rounded-full text-xs font-bold hover:bg-[#165a40] hover:shadow-[0_4px_20px_rgba(16,62,44,0.4)] transition-all active:scale-95 shadow-sm cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </nav>
    </header>
  )
}
