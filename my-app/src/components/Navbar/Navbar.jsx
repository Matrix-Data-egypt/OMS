import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ user, setUser }) => {
    const location = useLocation();

    return (
        <nav className="custom-navbar">
            {/* الجزء الأيسر: الشعار الجديد بالاسم الصحيح من مجلد public */}
            <div className="nav-brand-section">
                <Link to="/" className="nav-logo-link" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                    <img 
                        src="/oms-logo-no-names.png" 
                        alt="OMS One Media Solution Logo" 
                        style={{ height: '45px', width: 'auto', objectFit: 'contain' }} 
                    />
                </Link>
            </div>

            {/* الجزء الأوسط: روابط التنقل الفعالة */}
            <ul className="nav-menu-links">
                <li>
                    <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active-link' : ''}`}>
                        Home
                    </Link>
                </li>
                <li>
                    <Link to="/work" className={`nav-item ${location.pathname === '/work' ? 'active-link' : ''}`}>
                        Work
                    </Link>
                </li>
                <li>
                    <Link to="/outdoor" className={`nav-item ${location.pathname === '/outdoor' ? 'active-link' : ''}`}>
                        Outdoor
                    </Link>
                </li>
                <li>
                    <Link to="/poss" className={`nav-item ${location.pathname === '/poss' ? 'active-link' : ''}`}>
                        POSS
                    </Link>
                </li>
                <li>
                    <Link to="/about" className={`nav-item ${location.pathname === '/about' ? 'active-link' : ''}`}>
                        About
                    </Link>
                </li>
                <li>
                    <Link to="/production-tv" className={`nav-item ${location.pathname === '/production-tv' ? 'active-link' : ''}`}>
                        Production TV
                    </Link>
                </li>
                <li>
                    <Link to="/clients" className={`nav-item ${location.pathname === '/clients' ? 'active-link' : ''}`}>
                        Clients
                    </Link>
                </li>
            </ul>

            {/* الجزء الأيمن: زر بدء المشروع وأيقونة لوحة التحكم */}
            <div className="nav-actions-section">
                
                <Link to="/contact" className="nav-btn-primary">
                    START A PROJECT
                </Link>
                
                {/* منطقة الحساب وعرض زر الـ Dashboard عمودياً */}
                <div className="user-nav-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    
                    {/* 🌟 التعديل الأمني: يظهر فقط إذا كان المستخدم مسجلاً كـ مدير إداري حقيقي (admin) ولا يظهر للمسجلين الجدد */}
                    {user && user.role === 'admin' && (
                        <a
                          href={process.env.REACT_APP_ADMIN_URL || 'http://localhost:5173'}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: '11px', fontWeight: 'bold', color: '#f59e0b', textDecoration: 'none', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '3px 8px', borderRadius: '4px', marginBottom: '2px', textTransform: 'uppercase' }}
                        >
                            Panel Hub ↗
                        </a>
                    )}

                    {user ? (
                        <button 
                            onClick={() => { if(window.confirm('هل تريد تسجيل الخروج؟')) setUser(null); }}
                            className="nav-btn-user" 
                            style={{ border: 'none', cursor: 'pointer' }}
                            title="Log Out (تسجيل الخروج)"
                            aria-label="Log Out"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                        </button>
                    ) : (
                        <Link to="/login" className={`nav-btn-user ${location.pathname === '/login' ? 'active-link' : ''}`} aria-label="Login" title="Login">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </Link>
                    )}
                    
                    {/* 🌟 تعديل طباعة الاسم: قراءة user.name لمنع خطأ الـ Object كطفل في React */}
                    {user && (
                        <span className="navbar-username" style={{ fontSize: '10px', fontWeight: 'bold', color: '#7c3aed', letterSpacing: '0.05em' }}>
                            {user.name || user}
                        </span>
                    )}
                </div>

            </div>
        </nav>
    );
}

export default Navbar;
