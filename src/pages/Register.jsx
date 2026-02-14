import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Brain, ArrowRight, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import './Auth.css'

export default function Register() {
    const [step, setStep] = useState(1)
    const [role, setRole] = useState('teacher')

    return (
        <div className="auth-page">
            <div className="auth-bg-orbs">
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
            </div>

            <motion.div className="auth-card glass" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Link to="/" className="auth-brand">
                    <div className="brand-icon"><Brain size={20} /></div>
                    <span className="brand-text">Exam<span className="brand-highlight">AI</span></span>
                </Link>

                <h1>Create Account</h1>
                <p className="auth-subtitle">Join ExamAI to revolutionize your assessments</p>

                <div className="register-steps">
                    <div className={`step-dot ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`}></div>
                    <div className={`step-dot ${step >= 2 ? 'active' : ''} ${step > 2 ? 'done' : ''}`}></div>
                    <div className={`step-dot ${step >= 3 ? 'active' : ''}`}></div>
                </div>

                <form className="auth-form" onSubmit={e => { e.preventDefault(); if (step < 3) setStep(step + 1); else window.location.href = `/${role}` }}>
                    {step === 1 && (
                        <>
                            <div className="role-picker">
                                {['teacher', 'student'].map(r => (
                                    <button key={r} type="button" className={`role-btn ${role === r ? 'active' : ''}`} onClick={() => setRole(r)}>
                                        {r.charAt(0).toUpperCase() + r.slice(1)}
                                    </button>
                                ))}
                            </div>
                            <div className="input-group">
                                <label>Full Name</label>
                                <input type="text" className="input" placeholder="John Doe" />
                            </div>
                            <div className="input-group">
                                <label>Email Address</label>
                                <input type="email" className="input" placeholder="you@university.edu" />
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <div className="input-group">
                                <label>Password</label>
                                <input type="password" className="input" placeholder="Min. 8 characters" />
                            </div>
                            <div className="input-group">
                                <label>Confirm Password</label>
                                <input type="password" className="input" placeholder="Re-enter password" />
                            </div>
                            <div className="input-group">
                                <label>Institution</label>
                                <input type="text" className="input" placeholder="University / School name" />
                            </div>
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <div className="input-group">
                                <label>Department</label>
                                <input type="text" className="input" placeholder="e.g. Computer Science" />
                            </div>
                            <div className="input-group">
                                <label>Phone Number</label>
                                <input type="tel" className="input" placeholder="+91 XXXXX XXXXX" />
                            </div>
                            <label className="checkbox-label" style={{ marginTop: 8 }}>
                                <input type="checkbox" />
                                <span>I agree to the Terms of Service and Privacy Policy</span>
                            </label>
                        </>
                    )}

                    <div style={{ display: 'flex', gap: 12 }}>
                        {step > 1 && (
                            <button type="button" className="btn btn-secondary btn-lg" style={{ flex: 1 }} onClick={() => setStep(step - 1)}>
                                <ArrowLeft size={18} /> Back
                            </button>
                        )}
                        <button type="submit" className="btn btn-primary btn-lg" style={{ flex: 1 }}>
                            {step < 3 ? 'Continue' : 'Create Account'} <ArrowRight size={18} />
                        </button>
                    </div>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </motion.div>
        </div>
    )
}
