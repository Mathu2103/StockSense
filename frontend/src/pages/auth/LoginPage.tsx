import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import loginBg from '@/assets/images/login-bg.png'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    login('mock-token')
    navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-[#e8efe9] flex items-center justify-center p-4 sm:p-8 font-sans">
      
      {/* ── Main Container ── */}
      <div className="w-full max-w-[1000px] h-[600px] bg-white rounded-[2rem] shadow-2xl flex overflow-hidden relative">
        
        {/* ── Left Form Area (White) ── */}
        <div className="w-full lg:w-[48%] h-full flex flex-col justify-center px-8 sm:px-12 z-10 bg-white">
          
          <div className="max-w-sm w-full">
            <span className="text-xs font-bold text-surface-400 tracking-widest uppercase mb-3 block">
              Staff Portal
            </span>
            
            <h1 className="text-5xl leading-tight font-bold text-surface-900 mb-8 tracking-tight">
              Sign In<span className="text-primary-500">.</span>
            </h1>
            
            <form onSubmit={handleSignIn} className="flex flex-col gap-5">
              
              {/* Email Input */}
              <div className="bg-[#f8f9fa] border border-transparent rounded-2xl px-5 py-3 flex flex-col focus-within:border-primary-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary-50 transition-all group">
                <span className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider mb-1">Email</span>
                <div className="flex items-center">
                  <input 
                    type="email" 
                    placeholder="name@stocksense.com" 
                    className="w-full bg-transparent border-none outline-none text-surface-900 font-medium placeholder:text-surface-300 placeholder:font-normal" 
                    required 
                  />
                  <Mail size={18} className="text-surface-400 group-focus-within:text-primary-500 transition-colors" />
                </div>
              </div>

              {/* Password Input */}
              <div className="bg-[#f8f9fa] border border-transparent rounded-2xl px-5 py-3 flex flex-col focus-within:border-primary-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary-50 transition-all group">
                <span className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider mb-1">Password</span>
                <div className="flex items-center">
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="••••••••••••" 
                    className="w-full bg-transparent border-none outline-none text-surface-900 font-medium tracking-widest placeholder:tracking-normal placeholder:text-surface-300 placeholder:font-normal" 
                    required 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-surface-400 hover:text-primary-600 focus:outline-none transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center px-1 mt-2 mb-6">
                <a href="#" className="text-sm font-medium text-surface-500 hover:text-primary-600 transition-colors">Forgot Password?</a>
              </div>
              
              {/* Submit Buttons */}
              <div className="flex items-center gap-4">
                <button 
                  type="submit" 
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-full py-3.5 shadow-[0_8px_20px_rgba(0,76,34,0.25)] transition-all hover:shadow-[0_8px_25px_rgba(0,76,34,0.35)] hover:-translate-y-0.5 text-sm"
                >
                  Sign In
                </button>
              </div>

            </form>
          </div>
        </div>

        {/* ── Right Image Area (Organic Wave Split) ── */}
        <div className="hidden lg:block absolute top-0 right-0 w-[58%] h-full z-0 overflow-hidden bg-surface-100">
          
          {/* Background Image */}
          <img 
            src={loginBg} 
            alt="StockSense Team" 
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Organic White Wave overlaying the image to create the split effect */}
          <svg 
            className="absolute left-0 top-0 h-full w-[250px] text-white fill-current z-10" 
            viewBox="0 0 200 1000" 
            preserveAspectRatio="none"
          >
            <path d="M0,0 L200,0 C100,150 180,300 80,450 C-20,600 150,800 100,1000 L0,1000 Z" />
          </svg>

          {/* Decorative Dashed Line following the wave */}
          <svg 
            className="absolute left-[15px] top-0 h-full w-[250px] z-20 pointer-events-none" 
            viewBox="0 0 200 1000" 
            preserveAspectRatio="none"
          >
            <path 
              d="M0,0 L200,0 C100,150 180,300 80,450 C-20,600 150,800 100,1000 L0,1000 Z" 
              fill="none" 
              stroke="rgba(0,76,34,0.15)" 
              strokeWidth="2" 
              strokeDasharray="8 8" 
            />
          </svg>
          
          {/* Subtle overlay to enhance image contrast */}
          <div className="absolute inset-0 bg-black/5 z-0"></div>
          
        </div>

      </div>
    </div>
  )
}
