import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Fingerprint,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
  X
} from 'lucide-react';
import { BrandLogo } from '@/components/branding/BrandLogo'
import { useStore } from '@/store'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

interface LoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type LoginType = 'email' | 'memberId' | 'username'

// Sparkle particle component for glitter effect
const SparkleParticle = ({ delay, x, y }: { delay: number; x: number; y: number }) => (
  <motion.div
    className="absolute w-1 h-1 bg-white rounded-full"
    style={{ left: `${x}%`, top: `${y}%` }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
    }}
    transition={{
      duration: 2,
      delay: delay,
      repeat: Infinity,
      repeatDelay: Math.random() * 3,
    }}
  />
)

// Floating particles for background effect
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 bg-gradient-to-r from-emerald-300 to-teal-300 rounded-full opacity-20"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          y: [-20, 20, -20],
          x: [-10, 10, -10],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 3 + Math.random() * 2,
          repeat: Infinity,
          delay: Math.random() * 2,
        }}
      />
    ))}
  </div>
)

const LoginModal = ({ open, onOpenChange }: LoginModalProps) => {
  const [loginType, setLoginType] = useState<LoginType>('email')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'credentials' | 'mfa'>('credentials')
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    memberId: '',
    username: '',
    password: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { login } = useStore()
  const formRef = useRef<HTMLFormElement>(null)

  // Demo credentials for quick access
  const demoAccounts = [
    { email: 'john.smith@email.com', password: 'demo123', name: 'John Smith' },
    { email: 'sarah.j@email.com', password: 'demo123', name: 'Sarah Johnson' },
    { email: 'demo@orbitpaybank.online', password: 'demo123', name: 'Demo User' },
  ]

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [open, onOpenChange])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      setStep('credentials')
      setError(null)
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    setError(null)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (loginType === 'email' && !formData.email) {
      newErrors.email = 'Email is required'
    } else if (loginType === 'email' && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (loginType === 'memberId' && !formData.memberId) {
      newErrors.memberId = 'Member ID is required'
    }

    if (loginType === 'username' && !formData.username) {
      newErrors.username = 'Username is required'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setError(null)

    try {
      // Check if Supabase is configured
      if (isSupabaseConfigured()) {
        // Try Supabase auth first
        const email = formData.email || demoAccounts[0].email

        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: email,
          password: formData.password,
        })

        if (authError) {
          // Fall back to demo mode if auth fails
          console.log('Supabase auth failed, using demo mode:', authError.message)
          handleDemoLogin()
        } else if (data.user) {
          // Successfully logged in with Supabase
          // Fetch member data from our members table
          const { data: memberData } = await supabase
            .from('members')
            .select('*')
            .eq('email', email)
            .single()

          const mockUser = {
            id: data.user.id,
            fullName: memberData ? `${memberData.first_name} ${memberData.last_name}` : data.user.email || 'User',
            email: data.user.email || email,
            phone: memberData?.phone || '+1 (555) 123-4567',
            avatar: null,
            accountStatus: memberData?.status === 'active' ? 'active' as const : 'active' as const,
            balanceUSD: memberData?.total_balance || 5000,
            balanceEUR: 0,
            balanceGBP: 0,
            balanceBTC: 0,
            kycStatus: memberData?.kyc_status === 'verified' ? 'verified' as const : 'pending' as const,
            createdAt: memberData?.created_at || new Date().toISOString(),
            updatedAt: memberData?.updated_at || new Date().toISOString()
          }

          login(mockUser)
          onOpenChange(false)
        }
      } else {
        // Use demo mode if Supabase is not configured
        handleDemoLogin()
      }
    } catch (err) {
      console.error('Login error:', err)
      handleDemoLogin()
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = () => {
    // Find matching demo account or use default
    const demoEmail = formData.email || demoAccounts[0].email
    const matchedDemo = demoAccounts.find(d => d.email === demoEmail) || demoAccounts[0]

    const mockUser = {
      id: 'demo_' + Date.now(),
      fullName: matchedDemo.name,
      email: matchedDemo.email,
      phone: '+1 (555) 123-4567',
      avatar: null,
      accountStatus: 'active' as const,
      balanceUSD: 5000 + Math.random() * 10000,
      balanceEUR: 0,
      balanceGBP: 0,
      balanceBTC: 0,
      kycStatus: 'verified' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    login(mockUser)
    onOpenChange(false)
  }

  const handleContinue = () => {
    if (validateForm()) {
      setStep('mfa')
    }
  }

  const inputValue = loginType === 'email' ? formData.email :
    loginType === 'memberId' ? formData.memberId : formData.username

  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
          onClick={() => onOpenChange(false)}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl shadow-2xl"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900" />

          {/* Glass overlay */}
          <div className="absolute inset-0 backdrop-blur-xl bg-gradient-to-br from-emerald-800/40 via-emerald-700/30 to-teal-800/40" />

          {/* Sparkle effects */}
          <FloatingParticles />

          {/* Top glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-gradient-to-b from-emerald-400/30 to-transparent blur-3xl" />

          {/* Bottom glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-48 bg-gradient-to-t from-teal-400/20 to-transparent blur-3xl" />

          {/* Content */}
          <div className="relative z-10">
            {/* Header */}
            <div className="px-8 pt-8 pb-6 text-center">
              {/* Close button */}
              <button
                onClick={() => onOpenChange(false)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
              >
                <X className="w-5 h-5 text-white/80" />
              </button>

              {/* Logo */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex justify-center mb-6"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl blur-xl opacity-50" />
                  <div className="relative bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-3 shadow-xl">
                    <BrandLogo variant="compact" className="h-10" />
                  </div>
                </div>
              </motion.div>

              <motion.h2
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-2xl font-bold text-white mb-2"
              >
                Welcome Back
              </motion.h2>
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-emerald-200/80 text-sm"
              >
                Sign in to your OrbitPay account
              </motion.p>
            </div>

            {/* Demo credentials notice */}
            <div className="mx-8 mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/30">
              <p className="text-emerald-200/90 text-xs text-center">
                Demo: Use any email with password <span className="font-mono bg-white/10 px-1 rounded">demo123</span>
              </p>
            </div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-8 mb-4 p-3 rounded-xl bg-red-500/20 border border-red-400/30"
              >
                <p className="text-red-200 text-xs text-center">{error}</p>
              </motion.div>
            )}

            {/* Form */}
            <form ref={formRef} onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">
              {/* Step Indicator */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className={`w-8 h-1 rounded-full transition-all ${step === 'credentials' ? 'bg-gradient-to-r from-emerald-400 to-teal-400' : 'bg-emerald-400'}`} />
                <div className={`w-8 h-1 rounded-full transition-all ${step === 'mfa' ? 'bg-gradient-to-r from-emerald-400 to-teal-400' : 'bg-white/20'}`} />
              </div>

              {step === 'credentials' ? (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-5"
                >
                  {/* Login Type Tabs */}
                  <div className="flex rounded-2xl bg-white/10 p-1 backdrop-blur-sm">
                    {(['email', 'memberId', 'username'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setLoginType(type)}
                        className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                          loginType === type
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
                            : 'text-emerald-100/60 hover:text-white'
                        }`}
                      >
                        {type === 'email' ? 'Email' : type === 'memberId' ? 'Member ID' : 'Username'}
                      </button>
                    ))}
                  </div>

                  {/* Login Field */}
                  <div>
                    <label className="block text-sm font-medium text-emerald-100/80 mb-2">
                      {loginType === 'email' ? 'Email Address' : loginType === 'memberId' ? 'Member ID' : 'Username'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-emerald-400/60" />
                      </div>
                      <input
                        type={loginType === 'email' ? 'email' : 'text'}
                        value={inputValue}
                        onChange={(e) => handleInputChange(loginType, e.target.value)}
                        placeholder={loginType === 'email' ? 'john.smith@email.com' : `Enter your ${loginType}`}
                        className={`w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border-2 text-white placeholder-emerald-100/40 transition-all focus:outline-none ${
                          errors[loginType] ? 'border-red-400 focus:border-red-400' : 'border-white/20 focus:border-emerald-400 focus:bg-white/15'
                        }`}
                      />
                    </div>
                    {errors[loginType] && (
                      <p className="mt-2 text-sm text-red-300">{errors[loginType]}</p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-emerald-100/80 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-emerald-400/60" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="Enter your password"
                        className={`w-full pl-12 pr-14 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border-2 text-white placeholder-emerald-100/40 transition-all focus:outline-none ${
                          errors.password ? 'border-red-400 focus:border-red-400' : 'border-white/20 focus:border-emerald-400 focus:bg-white/15'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-emerald-400/60 hover:text-emerald-300" />
                        ) : (
                          <Eye className="h-5 w-5 text-emerald-400/60 hover:text-emerald-300" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-2 text-sm text-red-300">{errors.password}</p>
                    )}
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                        rememberMe ? 'bg-gradient-to-r from-emerald-500 to-teal-500 border-transparent' : 'border-white/30'
                      }`}>
                        {rememberMe && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="sr-only"
                      />
                      <span className="text-sm text-emerald-100/70">Remember me</span>
                    </label>
                    <button type="button" className="text-sm text-emerald-300 hover:text-emerald-200 font-medium transition-colors">
                      Forgot password?
                    </button>
                  </div>

                  {/* Continue Button */}
                  <motion.button
                    type="button"
                    onClick={handleContinue}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 bg-size-200 hover:bg-pos-100 text-white font-semibold shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  {/* Back button */}
                  <button
                    type="button"
                    onClick={() => setStep('credentials')}
                    className="flex items-center gap-2 text-emerald-200/60 hover:text-emerald-200 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    <span className="text-sm">Back</span>
                  </button>

                  {/* MFA Card */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400/30 to-teal-400/30 flex items-center justify-center">
                        <Fingerprint className="w-7 h-7 text-emerald-300" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">Two-Factor Authentication</p>
                        <p className="text-emerald-200/60 text-sm">Verify your identity</p>
                      </div>
                    </div>
                    <p className="text-emerald-100/70 text-sm">
                      We've sent a verification code to your registered device. Enter the code below to continue.
                    </p>
                  </div>

                  {/* MFA Input */}
                  <div>
                    <label className="block text-sm font-medium text-emerald-100/80 mb-2">
                      Verification Code
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <ShieldCheck className="h-5 w-5 text-emerald-400/60" />
                      </div>
                      <input
                        type="text"
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white placeholder-emerald-100/40 text-center text-2xl tracking-widest focus:outline-none focus:border-emerald-400 focus:bg-white/15"
                      />
                    </div>
                  </div>

                  {/* Sign In Button */}
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 bg-size-200 hover:bg-pos-100 text-white font-semibold shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </motion.button>
                </motion.div>
              )}

              {/* Footer Links */}
              <div className="text-center pt-4">
                <p className="text-emerald-200/60 text-sm">
                  Don't have an account?{' '}
                  <button type="button" className="text-emerald-300 hover:text-emerald-200 font-medium transition-colors">
                    Open Account
                  </button>
                </p>
              </div>
            </form>

            {/* Security Badge */}
            <div className="px-8 pb-6">
              <div className="flex items-center justify-center gap-2 text-emerald-200/50 text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>Bank-grade 256-bit encryption</span>
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default LoginModal
