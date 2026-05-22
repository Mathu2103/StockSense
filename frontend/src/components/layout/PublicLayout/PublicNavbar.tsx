import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function PublicNavbar() {
  const navigate = useNavigate()
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

  return (
    <header
      className={`bg-surface/80 backdrop-blur-md fixed full-width top-0 left-0 right-0 z-50 border-b border-outline-variant shadow-sm transition-all duration-300 ${scrolled ? 'py-2 shadow-md' : 'py-4'}`}
    >
      <nav className="flex justify-between items-center px-6 md:px-12 max-w-7xl mx-auto">
        <Link to="/" className="text-2xl font-bold text-primary">
          StockSense
        </Link>
        <div className="hidden md:flex gap-8 items-center">
          <Link
            className="text-on-surface-variant hover:text-primary text-sm transition-colors duration-200"
            to="/"
          >
            Home
          </Link>
          <Link
            className="text-on-surface-variant hover:text-primary text-sm transition-colors duration-200"
            to="/products"
          >
            Products
          </Link>
          <Link
            className="text-on-surface-variant hover:text-primary text-sm transition-colors duration-200"
            to="/offers"
          >
            Discount
          </Link>
          <a
            className="text-on-surface-variant hover:text-primary text-sm transition-colors duration-200"
            href="#"
          >
            About Us
          </a>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="bg-primary text-on-primary px-6 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-all active:scale-95 shadow-sm"
        >
          Get Started
        </button>
      </nav>
    </header>
  )
}
