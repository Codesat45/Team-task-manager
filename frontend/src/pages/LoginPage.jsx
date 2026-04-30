import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'
import { authService } from '../services/auth.service'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../utils/helpers'
import Spinner from '../components/ui/Spinner'

const LoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const errs = {}
    if (!form.email.trim()) errs.email = 'Email is required.'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email.'
    if (!form.password) errs.password = 'Password is required.'
    return errs
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const res = await authService.login(form)
      const { user, token } = res.data.data
      login(user, token)
      toast.success(`Welcome back, ${user.name}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Sign in to your account</h1>
        <p className="text-sm text-slate-500 mt-1">Enter your credentials to continue</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Email */}
        <div>
          <label className="label" htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className={`input ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
          />
          {errors.email && <p className="form-error">{errors.email}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="label" htmlFor="password">Password</label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`input pr-10 ${errors.password ? 'border-red-400 focus:ring-red-400' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="form-error">{errors.password}</p>}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 mt-2">
          {loading ? <Spinner size="sm" /> : <><LogIn size={16} /> Sign in</>}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-indigo-600 font-medium hover:underline">
          Create one
        </Link>
      </p>
    </div>
  )
}

export default LoginPage
