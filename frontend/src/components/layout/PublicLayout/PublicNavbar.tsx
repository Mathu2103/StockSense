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
        <div className="flex items-center gap-8">
          <div className="hidden md:flex gap-8 items-center">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path))
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm transition-colors duration-200 relative py-1 ${
                    isActive
                      ? 'text-[#103e2c] font-bold'
                      : 'text-gray-600 hover:text-[#103e2c] font-medium'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#103e2c] rounded-full" />
                  )}
                </Link>
              )
            })}
          </div>
          <button
            onClick={() => navigate('/login')}
            className="bg-[#103e2c] text-white px-5 py-2 rounded-full text-xs font-bold hover:bg-[#165a40] hover:shadow-md transition-all active:scale-95 shadow-sm cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </nav>
    </header>
  )
}
