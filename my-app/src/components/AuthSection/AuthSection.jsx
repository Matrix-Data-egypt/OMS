import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AuthSection.css'; 

export default function AuthSection({ setUser }) {
  const navigate = useNavigate(); 
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email.trim()) return alert('لقد نسيت كتابة خانة: البريد الإلكتروني (Email ID)');
    if (!formData.password.trim()) return alert('لقد نسيت كتابة خانة: كلمة المرور (Password)');

    const userNameRaw = formData.email.split('@')[0]; 
    const userNameFormatted = userNameRaw.toUpperCase(); 
    
    // التحقق من إيميل الآدمن لمنحه رتبة إدارية مخفية للـ Panel Hub
    const userRole = formData.email.trim().toLowerCase() === 'admin@omsadvertising.com' ? 'admin' : 'user';

    setUser({
      name: userNameFormatted,
      role: userRole
    }); 

    alert(`أهلاً بك يا ${userNameRaw}! تم تسجيل الدخول بنجاح 🎉`);
    navigate('/'); 
  };

  return (
    <div className="exact-auth-container" style={{ display: 'flex', width: '100vw', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF9F6', margin: 0, padding: 0 }}>
      <div className="exact-auth-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', width: '100%', maxWidth: '64rem', minHeight: '38rem', borderRadius: '0.5rem', overflow: 'hidden', boxShadow: '0 20px 30px rgba(0,0,0,0.04)' }}>
        
        {/* الشق الأيسر البنفسجي */}
        <div className="exact-left-panel">
          <div className="grid-overlay-blueprint"></div>
          
          <div className="panel-content-wrapper">
            <span className="company-top-tag">OMS ADVERTISING</span>
            
            <div className="center-text-group animate-fade-in-up">
              <p className="welcome-sub">Nice to see you again</p>
              <h2 className="welcome-main">WELCOME BACK</h2>
              <div className="exact-accent-line"></div>
              <p className="welcome-desc">
                Join our corporate environment. Deploy your industrial dashboards, manage briefs, and access your exclusive panels.
              </p>
            </div>
          </div>
          
          <div className="geo-circle circle-top"></div>
          <div className="geo-circle circle-bottom"></div>
        </div>

        {/* الشق الأيمن الأبيض للفورم */}
        <div className="exact-right-panel" style={{ backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
          <div className="exact-form-wrapper" style={{ width: '100%', maxWidth: '24rem', textAlign: 'center' }}>
            
            <h3 className="exact-login-title">Login Account</h3>
            <p className="exact-login-subdesc">Enter your credentials below to securely enter your dashboard workspace.</p>

            <form onSubmit={handleSubmit} className="exact-form-element">
              
              <div className="exact-input-box-group">
                <div className="exact-vertical-color-bar"></div>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email ID" 
                />
              </div>

              <div className="exact-input-box-group">
                <div className="exact-vertical-color-bar"></div>
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password" 
                />
              </div>

              <div className="exact-form-controls">
                <label className="exact-checkbox-label">
                  <input type="checkbox" defaultChecked /> Keep me signed in
                </label>
                <Link to="/signup" className="exact-member-link">
                  Create New Account?
                </Link>
              </div>

              <button type="submit" className="exact-subscribe-btn">
                SUBSCRIBE
              </button>

            </form>

          </div>
        </div>

      </div>
    </div>
  );
}
