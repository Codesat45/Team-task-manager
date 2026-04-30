import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import { authService } from '../services/auth.service'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../utils/helpers'
import Spinner from '../components/ui/Spinner'

const RegisterPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required.'
    else if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters.'
    if (!form.email.trim()) errs.email = 'Email is required.'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email.'
    if (!form.password) errs.password = 'Password is required.'
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters.'
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
      const res = await authService.register(form)
      const { user, token } = res.data.data
      login(user, token)
      toast.success(`Welcome, ${user.name}!`)
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
        <h1 className="text-xl font-bold text-slate-800">Create your account</h1>
        <p className="text-sm text-slate-500 mt-1">Get started with Team Task Manager today</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Name */}
        <div>
          <label className="label" htmlFor="name">Full name</label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={handleChange}
            placeholder="John Doe"
            className={`input ${errors.name ? 'border-red-400 focus:ring-red-400' : ''}`}
          />
          {errors.name && <p className="form-error">{errors.name}</p>}
        </div>

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
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
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

        {/* Role */}
        <div>
          <label className="label" htmlFor="role">Role</label>
          <select
            id="role"
            name="role"
            value={form.role}
            onChange={handleChange}
            className="input"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 mt-2">
          {loading ? <Spinner size="sm" /> : <><UserPlus size={16} /> Create account</>}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-600 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}

export default RegisterPage
