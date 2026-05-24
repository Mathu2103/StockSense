import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { authService } from '@/services/authService'
import { ArrowLeft, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react'
import manImg from '@/assets/images/man.png'
import groceryImg from '@/assets/images/grocery.png'

export default function LoginPage() {
  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState<string | null>(null)

  const { login, user, isAuthenticated, isLoading } = useAuth()
  const navigate  = useNavigate()

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user && !isLoading) {
      if (user.role === 'ADMIN') navigate('/admin')
      else if (user.role === 'CASHIER') navigate('/cashier/pos')
      else navigate('/inventory')
    }
  }, [isAuthenticated, user, isLoading, navigate])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Frontend Validation
    if (!email.includes('@') || !email.includes('.') || password.length < 6) {
      setError('Invalid email or password.')
      return
    }

    setLoading(true)
    try {
      const res = await authService.login({ email, password })
      login(res.data.token, res.data.user)
      // Role-based redirect
      if (res.data.user.role === 'ADMIN') {
        navigate('/admin')
      } else if (res.data.user.role === 'CASHIER') {
        navigate('/cashier/pos')
      } else {
        navigate('/inventory')
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Login failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen lg:h-screen w-full flex flex-col lg:flex-row bg-[#12362a] lg:bg-white overflow-y-auto lg:overflow-hidden font-sans">
      
      {/* ── LEFT PANEL (White with Blobs) ── */}
      <div className="relative w-full lg:w-[55%] h-full hidden lg:flex items-center justify-center bg-white z-0">
        
        {/* Scattered light green circles / Bubbles */}
        <div className="absolute top-[20%] left-[10%] w-16 h-16 rounded-full bg-[#d3e3dc] opacity-60 animate-float-1"></div>
        <div className="absolute top-[10%] left-[40%] w-12 h-12 rounded-full bg-[#d3e3dc] opacity-60 animate-float-2"></div>
        <div className="absolute bottom-[20%] left-[15%] w-24 h-24 rounded-full bg-[#d3e3dc] opacity-60 animate-float-3"></div>
        <div className="absolute bottom-[10%] left-[45%] w-14 h-14 rounded-full bg-[#d3e3dc] opacity-60 animate-float-1"></div>
        <div className="absolute top-[30%] right-[15%] w-20 h-20 rounded-full bg-[#d3e3dc] opacity-60 animate-float-2"></div>
        <div className="absolute bottom-[25%] right-[10%] w-16 h-16 rounded-full bg-[#d3e3dc] opacity-60 animate-float-3"></div>
        
        {/* Additional Bubbles for attractiveness */}
        <div className="absolute top-[5%] left-[20%] w-8 h-8 rounded-full bg-[#d3e3dc] opacity-50 animate-float-1"></div>
        <div className="absolute top-[15%] left-[60%] w-24 h-24 rounded-full bg-[#d3e3dc] opacity-40 animate-float-2"></div>
        <div className="absolute bottom-[35%] left-[5%] w-10 h-10 rounded-full bg-[#d3e3dc] opacity-70 animate-float-3"></div>
        <div className="absolute bottom-[5%] left-[30%] w-20 h-20 rounded-full bg-[#d3e3dc] opacity-50 animate-float-1"></div>
        <div className="absolute top-[45%] right-[5%] w-12 h-12 rounded-full bg-[#d3e3dc] opacity-60 animate-float-2"></div>
        <div className="absolute bottom-[40%] right-[20%] w-8 h-8 rounded-full bg-[#d3e3dc] opacity-80 animate-float-3"></div>
        <div className="absolute top-[50%] left-[25%] w-14 h-14 rounded-full bg-[#d3e3dc] opacity-40 animate-float-1"></div>
        <div className="absolute bottom-[15%] right-[25%] w-28 h-28 rounded-full bg-[#d3e3dc] opacity-30 animate-float-2"></div>

        {/* Organic Blobs Container */}
        <div className="relative w-[500px] h-[500px] flex items-center justify-center mt-12">
          {/* Outer Darker Blob */}
          <div 
            className="absolute inset-0 bg-[#679b8a]" 
            style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }}
          ></div>
          
          {/* Inner Lighter Blob */}
          <div 
            className="absolute w-[350px] h-[350px] bg-[#8db6a5]" 
            style={{ borderRadius: '50% 50% 40% 60% / 60% 40% 50% 50%' }}
          ></div>

          {/* Large Grocery Bag with Shadow */}
          <div className="relative z-10 flex flex-col items-center mb-4">
            <div className="absolute bottom-[10px] w-[260px] h-[22px] bg-[#588574] rounded-[50%] blur-[5px] z-0"></div>
            <img
              src={groceryImg}
              alt="Groceries"
              className="relative z-10 w-[340px] object-contain"
            />
          </div>
        </div>

        {/* Man pushing cart with Shadow */}
        <div className="absolute bottom-6 left-8 lg:left-16 xl:left-20 z-20 flex flex-col items-center">
          <div className="absolute bottom-[-2px] left-8 w-[320px] h-[16px] bg-[#d8e5df] rounded-[50%] blur-[4px] z-0 mix-blend-multiply"></div>
          <img
            src={manImg}
            alt="Man pushing cart"
            className="relative z-10 w-[380px] object-contain"
          />
        </div>
      </div>

      {/* ── RIGHT PANEL (Dark Green Form) ── */}
      <div className="relative w-full lg:w-[45%] min-h-screen lg:h-full bg-[#12362a] flex flex-col items-center justify-center py-16 lg:py-0 z-10">
        
        {/* Back to Home Button (Top Left - Arrow Only) */}
        <button 
          onClick={() => navigate('/')} 
          className="absolute top-4 left-4 sm:top-8 sm:left-8 flex items-center justify-center w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all shadow-sm hover:shadow-md z-30 group"
          aria-label="Back to Home"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
        </button>

        {/* SVG Wave Divider on the left edge */}
        <svg 
          className="absolute left-[-149px] top-0 w-[150px] h-full text-[#12362a] fill-current hidden lg:block" 
          viewBox="0 0 150 1000" 
          preserveAspectRatio="none"
        >
          <path d="M150,0 L150,1000 L80,1000 C150,750 -20,600 50,300 C80,150 20,50 100,0 Z" />
        </svg>

        {/* Form Container */}
        <div className="relative z-20 w-full max-w-[400px] px-8 flex flex-col items-center">
          
          <h1 className="text-3xl sm:text-4xl lg:text-[2.5rem] font-bold text-white tracking-wider mb-8 lg:mb-12">
            LOGIN
          </h1>

          <form onSubmit={handleSignIn} className="w-full flex flex-col gap-6">
            
            {/* Email */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-white/90 text-[15px] pl-1">Email</label>
              <div className="flex items-center bg-[#295c4d] rounded-full px-4 py-2.5 w-full">
                <div className="w-6 h-6 rounded-full border border-white/60 flex items-center justify-center mr-3 flex-shrink-0">
                  <Mail size={14} className="text-white/80" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent border-none outline-none text-white w-full text-[15px]"
                  placeholder="admin@stocksense.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-white/90 text-[15px] pl-1">Password</label>
              <div className="flex items-center bg-[#295c4d] rounded-full px-4 py-2.5 w-full">
                <div className="w-6 h-6 rounded-full border border-white/60 flex items-center justify-center mr-3 flex-shrink-0">
                  <Lock size={14} className="text-white/80" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`bg-transparent border-none outline-none text-white w-full text-[15px] ${!showPassword ? 'tracking-widest' : ''}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="ml-2 text-white/70 hover:text-white transition-colors focus:outline-none flex-shrink-0"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-2.5 text-red-300 text-[14px]">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Button */}
            <div className="flex justify-center mt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#488775] hover:bg-[#539684] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold tracking-wider rounded-md px-14 py-2.5 transition-colors text-[15px] flex items-center gap-2"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? 'Signing in...' : 'LOGIN'}
              </button>
            </div>

          </form>

        </div>

      </div>
      
    </div>
  )
}
