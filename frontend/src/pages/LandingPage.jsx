import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { CheckSquare, ArrowRight, Zap, Shield, Users, BarChart3, ChevronDown, Star, Clock, Target, TrendingUp, Menu, X } from "lucide-react"

// ─── Animated Counter ─────────────────────────────────────────────────────────
const Counter = ({ end, suffix = "", duration = 2000 }) => {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const startTime = performance.now()
        const tick = (now) => {
          const elapsed = now - startTime
          const progress = Math.min(elapsed / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setCount(Math.floor(eased * end))
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end, duration])
  return <span ref={ref}>{count}{suffix}</span>
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
const FeatureCard = ({ icon: Icon, title, desc, color, delay = 0 }) => {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.2 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return (
    <div
      ref={ref}
      className="peach-card group cursor-default"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <h3 className="text-[#2d1a0e] font-bold text-lg mb-2">{title}</h3>
      <p className="text-[#7a5c4a] text-sm leading-relaxed">{desc}</p>
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#e8845a] to-[#f4a261] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-b-2xl" />
    </div>
  )
}

// ─── Floating Task Card ───────────────────────────────────────────────────────
const FloatingCard = ({ title, status, project, delay, className }) => {
  const colors = {
    "Completed": "bg-green-100 text-green-700 border-green-200",
    "In Progress": "bg-orange-100 text-orange-700 border-orange-200",
    "Todo": "bg-peach-100 text-[#c1440e] border-[#f4c9b0]",
  }
  return (
    <div
      className={`peach-glass rounded-xl p-3.5 w-56 shadow-xl ${className}`}
      style={{ animation: `float 6s ease-in-out ${delay}s infinite` }}
    >
      <p className="text-[#2d1a0e] text-xs font-semibold truncate mb-1.5">{title}</p>
      <p className="text-[#9a6a52] text-xs mb-2">{project}</p>
      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${colors[status]}`}>{status}</span>
    </div>
  )
}

// ─── Mini Dashboard Preview ───────────────────────────────────────────────────
const DashboardPreview = () => {
  const bars = [65, 80, 45, 90, 70, 55, 85]
  const days = ["M", "T", "W", "T", "F", "S", "S"]
  return (
    <div className="peach-glass rounded-2xl p-5 w-full max-w-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[#2d1a0e] text-sm font-bold">Weekly Progress</span>
        <span className="text-[#e8845a] text-xs font-semibold">This Week</span>
      </div>
      <div className="flex items-end gap-2 h-24">
        {bars.map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-t-md bar-animate"
              style={{
                height: `${h}%`,
                background: i === 3
                  ? "linear-gradient(to top, #e8845a, #f4a261)"
                  : "rgba(232,132,90,0.25)",
                animationDelay: `${i * 0.1}s`,
              }}
            />
            <span className="text-[#b07a60] text-xs">{days[i]}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[["24", "Tasks Done"], ["3", "Projects"], ["92%", "On Time"]].map(([v, l]) => (
          <div key={l} className="text-center">
            <p className="text-[#2d1a0e] font-bold text-base">{v}</p>
            <p className="text-[#9a6a52] text-xs">{l}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Landing Page ────────────────────────────────────────────────────────
const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
    setMobileOpen(false)
  }

  const features = [
    { icon: Target, title: "Smart Task Assignment", desc: "Assign tasks to team members with role-based permissions. Admins control everything, members update their own work.", color: "bg-[#e8845a]", delay: 0 },
    { icon: Shield, title: "Role-Based Access", desc: "Strict RBAC ensures admins manage projects while members stay focused on their assigned tasks only.", color: "bg-[#c1440e]", delay: 100 },
    { icon: BarChart3, title: "Live Dashboard", desc: "Real-time stats on task completion, overdue items, and team progress — all in one interactive view.", color: "bg-[#f4a261]", delay: 200 },
    { icon: Users, title: "Team Collaboration", desc: "Add and remove members per project. Everyone sees exactly what they need, nothing more.", color: "bg-[#e76f51]", delay: 300 },
    { icon: Clock, title: "Due Date Tracking", desc: "Never miss a deadline. Overdue tasks are flagged automatically with visual alerts.", color: "bg-[#d4845a]", delay: 400 },
    { icon: Zap, title: "Instant Updates", desc: "Status changes reflect immediately. Filter, search, and sort tasks with zero page reloads.", color: "bg-[#b05c3a]", delay: 500 },
  ]

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "linear-gradient(135deg, #fff8f4 0%, #fef0e8 30%, #fde8d8 60%, #fddcc8 100%)" }}>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-xl border-b border-[#f4c9b0]/60 shadow-lg shadow-[#e8845a]/10" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-[#e8845a] to-[#c1440e] rounded-lg flex items-center justify-center shadow-lg shadow-[#e8845a]/30">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="3" width="16" height="18" rx="2" stroke="white" strokeWidth="2" fill="none"/>
                <path d="M9 3h6a1 1 0 0 1 0 2H9a1 1 0 0 1 0-2z" fill="white"/>
                <path d="M8 12l2.5 2.5L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-bold text-lg text-[#2d1a0e]">Team Task Manager</span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {[["Features", "features"], ["How It Works", "how"], ["Stats", "stats"]].map(([label, id]) => (
              <button key={id} onClick={() => scrollTo(id)} className="px-4 py-2 text-sm text-[#7a5c4a] hover:text-[#2d1a0e] rounded-lg hover:bg-[#f4c9b0]/40 transition-all font-medium">
                {label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-sm text-[#7a5c4a] hover:text-[#2d1a0e] transition-colors font-medium">Sign In</Link>
            <Link to="/register" className="px-4 py-2 text-sm font-bold text-white rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-[#e8845a]/30"
              style={{ background: "linear-gradient(135deg, #e8845a, #c1440e)" }}>
              Get Started Free
            </Link>
          </div>

          <button onClick={() => setMobileOpen(v => !v)} className="md:hidden p-2 text-[#7a5c4a] hover:text-[#2d1a0e]">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-[#f4c9b0]/60 px-4 py-4 space-y-2">
            {[["Features", "features"], ["How It Works", "how"], ["Stats", "stats"]].map(([label, id]) => (
              <button key={id} onClick={() => scrollTo(id)} className="block w-full text-left px-3 py-2 text-sm text-[#7a5c4a] hover:text-[#2d1a0e] rounded-lg hover:bg-[#f4c9b0]/40">{label}</button>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              <Link to="/login" className="px-3 py-2 text-sm text-center text-[#7a5c4a] border border-[#f4c9b0] rounded-lg hover:bg-[#f4c9b0]/30">Sign In</Link>
              <Link to="/register" className="px-3 py-2 text-sm text-center font-bold text-white rounded-lg" style={{ background: "linear-gradient(135deg, #e8845a, #c1440e)" }}>Get Started Free</Link>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Peach orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="orb-1 absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-30" style={{ background: "radial-gradient(circle, #f4a261, transparent 70%)" }} />
          <div className="orb-2 absolute top-1/3 right-1/4 w-80 h-80 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #e8845a, transparent 70%)" }} />
          <div className="orb-3 absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #c1440e, transparent 70%)" }} />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(232,132,90,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(232,132,90,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 items-center py-20">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-6 border border-[#e8845a]/40 bg-[#e8845a]/10 text-[#c1440e]">
              <Zap size={12} className="text-[#e8845a]" />
              Built for modern teams
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6 text-[#2d1a0e]">
              Manage Tasks.{" "}
              <span className="peach-gradient-text">Ship Faster.</span>
              <br />
              <span className="text-[#7a5c4a]">Stay in Control.</span>
            </h1>

            <p className="text-[#7a5c4a] text-lg leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
              Team Task Manager gives your team a single place to track projects, assign work, and hit deadlines — with role-based access that keeps everyone focused.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-10">
              <Link to="/register"
                className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-bold text-white rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-xl shadow-[#e8845a]/30"
                style={{ background: "linear-gradient(135deg, #e8845a, #c1440e)" }}>
                Start for Free <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-bold text-[#2d1a0e] rounded-xl border-2 border-[#e8845a]/40 hover:bg-[#e8845a]/10 transition-all duration-200">
                Sign In
              </Link>
            </div>

            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              <div className="peach-pill text-[#7a5c4a]"><Star size={13} className="text-[#e8845a]" /> Trusted by teams</div>
              <div className="peach-pill text-[#7a5c4a]"><Shield size={13} className="text-green-600" /> Secure by default</div>
              <div className="peach-pill text-[#7a5c4a]"><Zap size={13} className="text-[#e8845a]" /> Real-time updates</div>
            </div>
          </div>

          <div className="relative flex items-center justify-center h-96 lg:h-auto">
            <div className="relative w-full max-w-md">
              <div className="relative z-10 mx-auto"><DashboardPreview /></div>
              <FloatingCard title="Design system update" status="In Progress" project="Website Redesign" delay={0} className="absolute -top-8 -right-4 z-20 hidden sm:block" />
              <FloatingCard title="API integration done" status="Completed" project="Backend API" delay={2} className="absolute -bottom-6 -left-4 z-20 hidden sm:block" />
              <FloatingCard title="Write test cases" status="Todo" project="QA Sprint" delay={4} className="absolute top-1/2 -right-8 z-20 hidden lg:block" />
            </div>
          </div>
        </div>

        <button onClick={() => scrollTo("features")} className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[#c1440e]/50 hover:text-[#c1440e] transition-colors animate-bounce">
          <ChevronDown size={24} />
        </button>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e8845a]/30 to-transparent" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-[#e8845a] text-sm font-bold uppercase tracking-widest mb-3">Everything you need</p>
            <h2 className="text-3xl sm:text-4xl font-black text-[#2d1a0e] mb-4">
              Built for how teams <span className="peach-gradient-text">actually work</span>
            </h2>
            <p className="text-[#7a5c4a] max-w-xl mx-auto">No bloat. No complexity. Just the tools your team needs to stay aligned and ship on time.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────────── */}
      <section id="how" className="py-24 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f4a261]/40 to-transparent" />
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-[#e8845a] text-sm font-bold uppercase tracking-widest mb-3">Simple workflow</p>
            <h2 className="text-3xl sm:text-4xl font-black text-[#2d1a0e] mb-4">Up and running in <span className="peach-gradient-text">3 steps</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-10 left-1/6 right-1/6 h-px bg-gradient-to-r from-[#e8845a]/50 via-[#f4a261]/50 to-[#c1440e]/50" />
            {[
              { step: "01", icon: Users, title: "Create your team", desc: "Sign up as Admin, create a project, and invite your team members in seconds.", color: "from-[#e8845a] to-[#f4a261]" },
              { step: "02", icon: CheckSquare, title: "Assign tasks", desc: "Break work into tasks, set due dates, and assign them to the right people.", color: "from-[#c1440e] to-[#e8845a]" },
              { step: "03", icon: TrendingUp, title: "Track progress", desc: "Watch your dashboard update in real-time as tasks move from Todo to Done.", color: "from-[#f4a261] to-[#e8845a]" },
            ].map(({ step, icon: Icon, title, desc, color }) => (
              <div key={step} className="relative text-center group">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-5 shadow-xl shadow-[#e8845a]/20 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={28} className="text-white" />
                </div>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white border-2 border-[#e8845a]/40 flex items-center justify-center shadow-sm">
                  <span className="text-xs font-bold text-[#e8845a]">{step}</span>
                </div>
                <h3 className="text-[#2d1a0e] font-bold text-lg mb-2">{title}</h3>
                <p className="text-[#7a5c4a] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────────────────────────────── */}
      <section id="stats" className="py-24 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e8845a]/30 to-transparent" />
          <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(ellipse at center, #f4c9b0 0%, transparent 70%)" }} />
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-[#e8845a] text-sm font-bold uppercase tracking-widest mb-3">By the numbers</p>
            <h2 className="text-3xl sm:text-4xl font-black text-[#2d1a0e] mb-4">
              Teams that use Team Task Manager <span className="peach-gradient-text">deliver more</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { end: 40, suffix: "%", label: "Faster delivery", sub: "vs. no task manager", color: "text-[#e8845a]" },
              { end: 3, suffix: "x", label: "Better visibility", sub: "across all projects", color: "text-[#c1440e]" },
              { end: 90, suffix: "%", label: "On-time rate", sub: "with due date tracking", color: "text-[#f4a261]" },
              { end: 60, suffix: "%", label: "Less missed tasks", sub: "with role-based alerts", color: "text-[#d4845a]" },
            ].map(({ end, suffix, label, sub, color }) => (
              <div key={label} className="peach-glass rounded-2xl p-6 text-center hover:shadow-xl hover:shadow-[#e8845a]/20 transition-all duration-300 hover:-translate-y-1">
                <p className={`text-4xl font-black mb-1 ${color}`}><Counter end={end} suffix={suffix} /></p>
                <p className="text-[#2d1a0e] font-bold text-sm mb-1">{label}</p>
                <p className="text-[#9a6a52] text-xs">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e8845a]/30 to-transparent" />
          <div className="orb-1 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, #f4a261, transparent 70%)" }} />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-5xl font-black text-[#2d1a0e] mb-6">
            Ready to take control of <span className="peach-gradient-text">your projects?</span>
          </h2>
          <p className="text-[#7a5c4a] text-lg mb-10 max-w-xl mx-auto">
            Create your account in seconds. No credit card. No setup fees. Just your team and your tasks.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-xl shadow-[#e8845a]/30"
              style={{ background: "linear-gradient(135deg, #e8845a, #c1440e)" }}>
              Create Free Account <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-[#2d1a0e] rounded-xl border-2 border-[#e8845a]/40 hover:bg-[#e8845a]/10 transition-all duration-200">
              Already have an account?
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#f4c9b0]/60 py-10" style={{ background: "rgba(255,240,232,0.6)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-gradient-to-br from-[#e8845a] to-[#c1440e] rounded-lg flex items-center justify-center">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <rect x="4" y="3" width="16" height="18" rx="2" stroke="white" strokeWidth="2" fill="none"/>
                  <path d="M9 3h6a1 1 0 0 1 0 2H9a1 1 0 0 1 0-2z" fill="white"/>
                  <path d="M8 12l2.5 2.5L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="font-bold text-[#2d1a0e]">Team Task Manager</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-[#9a6a52]">
              {[["Features", "features"], ["How It Works", "how"], ["Stats", "stats"]].map(([label, id]) => (
                <button key={id} onClick={() => scrollTo(id)} className="hover:text-[#2d1a0e] transition-colors">{label}</button>
              ))}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Link to="/login" className="text-[#9a6a52] hover:text-[#2d1a0e] transition-colors">Sign In</Link>
              <Link to="/register" className="px-4 py-1.5 text-white rounded-lg font-bold transition-all hover:opacity-90 shadow-md shadow-[#e8845a]/20"
                style={{ background: "linear-gradient(135deg, #e8845a, #c1440e)" }}>
                Get Started
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-[#f4c9b0]/40 text-center">
            <p className="text-[#b07a60] text-xs">© {new Date().getFullYear()} Team Task Manager. Built for teams who ship.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
