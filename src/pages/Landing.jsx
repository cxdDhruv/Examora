import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import {
    Brain, Shield, BarChart3, FileText, Eye, Upload,
    Zap, Lock, ArrowRight, CheckCircle, Star, ChevronRight
} from 'lucide-react'
import logo from '../assets/logo.png'
import ownerImg from '../assets/owner.JPG'
import './Landing.css'

const features = [
    { icon: Brain, title: 'AI Question Generation', desc: 'Auto-generate MCQs, True/False, Fill-in-the-Blanks from uploaded documents using NLP', color: '#818cf8' },
    { icon: Upload, title: 'Document Processing', desc: 'Upload PDF, DOCX, TXT files — AI extracts key concepts and generates questions', color: '#22d3ee' },
    { icon: Shield, title: 'Advanced Security', desc: 'Tab-switch detection, fullscreen enforcement, copy-paste blocking, screenshot prevention', color: '#f87171' },
    { icon: Eye, title: 'AI Proctoring', desc: 'Face detection, multi-person monitoring, head pose estimation, object detection via YOLO', color: '#4ade80' },
    { icon: Zap, title: 'Smart Auto-Submit', desc: 'Risk-based violation scoring with automatic submission when thresholds are exceeded', color: '#fbbf24' },
    { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Heat maps, time analysis, risk scores, weak topic detection, and exportable reports', color: '#a78bfa' },
    { icon: FileText, title: 'Plagiarism Detection', desc: 'AI similarity analysis, LLM-content detection, cross-student answer comparison', color: '#fb923c' },
    { icon: Lock, title: 'Secure Exam Builder', desc: 'Drag-and-drop editor with auto-shuffle, section locking, and adaptive difficulty', color: '#34d399' },
]

const comparisons = [
    { form: 'No AI question generation', ours: 'NLP-powered question extraction & generation' },
    { form: 'Weak anti-cheating controls', ours: 'Multi-layered behavioral analysis + AI proctoring' },
    { form: 'No real proctoring', ours: 'Face detection, gaze tracking, object detection' },
    { form: 'No tab-switch detection', ours: 'Real-time tab & focus monitoring' },
    { form: 'Basic analytics only', ours: 'Heat maps, risk scores, weak topic identification' },
    { form: 'No plagiarism detection', ours: 'AI plagiarism + LLM content detection' },
]

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } })
}

export default function Landing() {
    return (
        <div className="landing">
            <Navbar />

            {/* Hero */}
            <section className="hero">
                <div className="hero-bg-orbs">
                    <div className="orb orb-1"></div>
                    <div className="orb orb-2"></div>
                    <div className="orb orb-3"></div>
                </div>
                <div className="container hero-content">
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="hero-text">
                        <span className="hero-badge">
                            <Star size={14} /> AI-Powered Examination Platform
                        </span>
                        <h1>
                            The Future of <br />
                            <span className="gradient-text">Secure Online Exams</span>
                        </h1>
                        <p>
                            Generate high-quality questions from documents using AI. Ensure academic integrity with intelligent proctoring,
                            behavioral analysis, and real-time violation detection.
                        </p>
                        <div className="hero-actions">
                            <Link to="/register" className="btn btn-primary btn-lg">
                                Get Started <ArrowRight size={18} />
                            </Link>
                            <Link to="/login" className="btn btn-secondary btn-lg">
                                Sign In
                            </Link>
                        </div>
                        <div className="hero-stats">
                            <div><strong>10K+</strong><span>Exams Created</span></div>
                            <div><strong>50K+</strong><span>Students</span></div>
                            <div><strong>99.2%</strong><span>Uptime</span></div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.3 }} className="hero-visual">
                        <div className="hero-card glass">
                            <div className="hero-card-header">
                                <div className="dots"><span></span><span></span><span></span></div>
                                <span>AI Question Generator</span>
                            </div>
                            <div className="hero-card-body">
                                <div className="gen-line"><span className="gen-label">Source:</span> <span className="gen-file">physics_chapter3.pdf</span></div>
                                <div className="gen-progress">
                                    <div className="gen-progress-bar"><div className="fill" style={{ width: '78%' }}></div></div>
                                    <span>78% processed</span>
                                </div>
                                <div className="gen-result">
                                    <div className="gen-q">
                                        <span className="badge badge-info">MCQ</span>
                                        <span className="badge badge-warning">Medium</span>
                                    </div>
                                    <p className="gen-question">"What is Newton's second law of motion?"</p>
                                    <div className="gen-options">
                                        <div className="gen-opt correct">A) F = ma ✓</div>
                                        <div className="gen-opt">B) F = mv</div>
                                        <div className="gen-opt">C) E = mc²</div>
                                        <div className="gen-opt">D) v = at</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features */}
            <section className="features-section" id="features">
                <div className="container">
                    <div className="section-header">
                        <h2>Eight Powerful <span className="gradient-text-purple">AI Modules</span></h2>
                        <p>Every aspect of online examination — automated, secured, and analyzed</p>
                    </div>
                    <div className="features-grid">
                        {features.map((f, i) => (
                            <motion.div key={i} className="feature-card glass" custom={i} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={fadeUp}>
                                <div className="feature-icon" style={{ background: `${f.color}15`, color: f.color }}>
                                    <f.icon size={24} />
                                </div>
                                <h3>{f.title}</h3>
                                <p>{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Comparison */}
            <section className="comparison-section" id="comparison">
                <div className="container">
                    <div className="section-header">
                        <h2>Why <span className="gradient-text-purple">Examora</span> over Google Forms?</h2>
                        <p>Traditional form tools fail at academic integrity. We fix that.</p>
                    </div>
                    <div className="comparison-table glass">
                        <div className="comparison-header">
                            <div>Google Forms Limitation</div>
                            <div>Examora Solution</div>
                        </div>
                        {comparisons.map((c, i) => (
                            <motion.div key={i} className="comparison-row" custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                                <div className="comp-bad">{c.form}</div>
                                <div className="comp-good"><CheckCircle size={16} /> {c.ours}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-card glass">
                        <h2>Ready to Transform Online Assessment?</h2>
                        <p>Start generating AI-powered exams in minutes. Secure, intelligent, and effortless.</p>
                        <Link to="/register" className="btn btn-primary btn-lg">
                            Create Free Account <ChevronRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container footer-inner">
                    <div className="footer-grid">
                        <div className="footer-brand">
                            <div className="navbar-brand">
                                <img src={logo} alt="Examora" className="brand-logo" style={{ height: 28, width: 'auto' }} />
                                <span className="brand-text">Examora</span>
                            </div>
                            <p>AI-Driven Secure Online Examination System. Generating high-quality questions and ensuring academic integrity.</p>
                        </div>

                        <div className="footer-links">
                            <div>
                                <h4>Product</h4>
                                <a href="#features">Features</a>
                                <a href="#modules">Modules</a>
                                <a href="#comparison">Compare</a>
                            </div>
                            <div>
                                <h4>Quick Access</h4>
                                <Link to="/login">Sign In</Link>
                                <Link to="/register">Register</Link>
                                <Link to="/teacher">Dashboard</Link>
                            </div>
                        </div>

                        <div className="footer-owner-section">
                            <div className="owner-credit">
                                <img src={ownerImg} alt="Dhruv Jasani" className="owner-img" />
                                <div className="owner-info">
                                    <span className="owner-name">Dhruv Jasani</span>
                                    <span className="owner-degree">Mechatronics Student • GCET</span>
                                    <a href="mailto:jasanidhruv256@gmail.com" className="owner-email">jasanidhruv256@gmail.com</a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <span>© 2026 Examora. All rights reserved.</span>
                    </div>
                </div>
            </footer>
        </div>
    )
}
