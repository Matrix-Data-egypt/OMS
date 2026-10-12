import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // تم استيراد Link هنا لربط العودة العكسية
import './SignUpSection.css'; 

export default function SignUpSection({ setUser }) {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    confirmEmail: '',
    gender: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.fullName.trim()) return alert('لقد نسيت كتابة خانة: الاسم الكامل (Full Name)');
    if (!formData.email.trim()) return alert('لقد نسيت كتابة خانة: البريد الإلكتروني (Email Address)');
    if (!formData.confirmEmail.trim()) return alert('لقد نسيت كتابة خانة: تأكيد البريد الإلكتروني (Confirm Email)');
    if (formData.email.trim().toLowerCase() !== formData.confirmEmail.trim().toLowerCase()) {
      return alert('خطأ: البريد الإلكتروني وتأكيد البريد الإلكتروني غير متطابقين!');
    }
    if (!formData.gender) return alert('رجاءً قم باختيار خانة: الجنس (Gender)');
    if (!formData.password.trim()) return alert('لقد نسيت كتابة خانة: كلمة المرور (Password)');
    if (!formData.confirmPassword.trim()) return alert('لقد نسيت كتابة خانة: تأكيد كلمة المرور (Confirm Password)');
    if (formData.password !== formData.confirmPassword) {
      return alert('خطأ: كلمة المرور وتأكيد كلمة المرور غير متطابقين!');
    }

    // 🌟 التعديل هنا: حفظ بيانات المستخدم ككائن برتبة 'user' لمنع ظهور زر لوحة التحكم له تماماً
    setUser({
      name: formData.fullName.trim().toUpperCase(),
      role: 'user'
    });

    alert(`أهلاً بكِ في عائلة OMS يا ${formData.fullName}! تم إنشاء الحساب بنجاح 🎉`);
    navigate('/');
  };

  return (
    <div className="exact-signup-container">
      <div className="exact-signup-card">
        
        {/* الشق الأيسر: الرسوم التعبيرية والترحيب الحركي بـ OMS */}
        <div className="signup-left-panel-animated">
          <div className="signup-grid-blueprint"></div>
          
          <div className="signup-panel-content">
            <span className="signup-top-brand">OMS ADVERTISING</span>
            
            <div className="signup-center-message">
              <p className="signup-welcome-sub">Explore the Next Horizon</p>
              <h2 className="signup-welcome-main">WELCOME TO OMS</h2>
              <div className="signup-accent-line"></div>
              <p className="signup-welcome-desc">
                Join our integrated advertising environment. Build your strategic project briefs, track performance growth indices, and scale with absolute commercial certainty.
              </p>
            </div>
          </div>
          
          <div className="signup-geo-circle circle-1"></div>
          <div className="signup-geo-circle circle-2"></div>
          <div className="signup-floating-glow"></div>
        </div>

        {/* الشق الأيمن: الخانات الستة المتكاملة ونظام الحواف الملونة */}
        <div className="signup-right-panel-form">
          <div className="signup-form-wrapper">
            
            <h3 className="signup-form-title">Create Account</h3>
            <p className="signup-form-subdesc">Set up your institutional dashboard credentials to deploy your corporate engine panels.</p>

            <form onSubmit={handleSubmit} className="signup-exact-form">
              
              {/* 1. Full Name */}
              <div className="signup-input-group-box">
                <div className="signup-vertical-purple-bar"></div>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Full Name" />
              </div>

              {/* 2. Email Address */}
              <div className="signup-input-group-box">
                <div className="signup-vertical-purple-bar"></div>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email ID" />
              </div>

              {/* 3. Confirm Email */}
              <div className="signup-input-group-box">
                <div className="signup-vertical-purple-bar"></div>
                <input type="email" name="confirmEmail" value={formData.confirmEmail} onChange={handleInputChange} placeholder="Confirm Email ID" />
              </div>

              {/* 4. Gender */}
              <div className="signup-input-group-box">
                <div className="signup-vertical-purple-bar"></div>
                <select name="gender" value={formData.gender} onChange={handleInputChange} className="signup-custom-select">
                  <option value="" disabled hidden>Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              {/* 5. Password */}
              <div className="signup-input-group-box">
                <div className="signup-vertical-purple-bar"></div>
                <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Password" />
              </div>

              {/* 6. Confirm Password */}
              <div className="signup-input-group-box">
                <div className="signup-vertical-purple-bar"></div>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="Confirm Password" />
              </div>

              {/* زر التقديم SUBSCRIBE */}
              <button type="submit" className="signup-subscribe-action-btn">
                SUBSCRIBE
              </button>

              {/* التعديل هنا: تم إدراج رابط العودة السريع لصفحة تسجيل الدخول بنمط الهوية */}
              <div style={{ marginTop: '1.25rem', fontSize: '0.85rem' }}>
                <Link to="/login" style={{ color: '#ed3a3a', textDecoration: 'none', fontWeight: '700' }}>
                  Already have an account? Sign In
                </Link>
              </div>

            </form>

          </div>
        </div>

      </div>
    </div>
  );
}
