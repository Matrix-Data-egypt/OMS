import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './SignUpSection.css';

export default function SignUpSection() {
  const navigate = useNavigate();
  const { registerCustomer, loading } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    confirmEmail: '',
    gender: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors]       = useState({});
  const [apiError, setApiError]   = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-level error on change
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (apiError) setApiError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim())          newErrors.fullName = 'الاسم الكامل مطلوب.';
    if (!formData.email.trim())             newErrors.email = 'البريد الإلكتروني مطلوب.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()))
                                             newErrors.email = 'البريد الإلكتروني غير صالح.';
    if (!formData.confirmEmail.trim())      newErrors.confirmEmail = 'تأكيد البريد الإلكتروني مطلوب.';
    else if (formData.email.trim().toLowerCase() !== formData.confirmEmail.trim().toLowerCase())
                                             newErrors.confirmEmail = 'البريدان الإلكترونيان غير متطابقين.';
    if (!formData.password.trim())          newErrors.password = 'كلمة المرور مطلوبة.';
    else if (formData.password.trim().length < 6)
                                             newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.';
    if (!formData.confirmPassword.trim())   newErrors.confirmPassword = 'تأكيد كلمة المرور مطلوب.';
    else if (formData.password !== formData.confirmPassword)
                                             newErrors.confirmPassword = 'كلمتا المرور غير متطابقتين.';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      return setErrors(validationErrors);
    }

    const result = await registerCustomer({
      fullName:  formData.fullName.trim(),
      email:     formData.email.trim(),
      gender:    formData.gender || undefined,
      phone:     formData.phone.trim() || undefined,
      password:  formData.password.trim(),
    });

    if (result.ok) {
      setSuccessMsg(result.message);
      setTimeout(() => navigate('/'), 1200);
    } else {
      setApiError(result.message || 'حدث خطأ أثناء إنشاء الحساب. حاول مرة أخرى.');
    }
  };

  return (
    <div className="exact-signup-container">
      <div className="exact-signup-card">

        {/* Left Animated Panel */}
        <div className="signup-left-panel-animated">
          <div className="signup-grid-blueprint"></div>

          <div className="signup-panel-content">
            <span className="signup-top-brand">OMS ADVERTISING</span>

            <div className="signup-center-message">
              <p className="signup-welcome-sub">Explore the Next Horizon</p>
              <h2 className="signup-welcome-main">WELCOME TO OMS</h2>
              <div className="signup-accent-line"></div>
              <p className="signup-welcome-desc">
                Join our integrated advertising environment. Build your strategic project briefs, track performance growth, and scale with absolute commercial certainty.
              </p>
            </div>
          </div>

          <div className="signup-geo-circle circle-1"></div>
          <div className="signup-geo-circle circle-2"></div>
          <div className="signup-floating-glow"></div>
        </div>

        {/* Right Form Panel */}
        <div className="signup-right-panel-form">
          <div className="signup-form-wrapper">

            <h1 className="signup-form-title">Create Account</h1>
            <p className="signup-form-subdesc">
              Register to access your OMS client dashboard, track briefs, and stay in touch with our team.
            </p>

            {/* API Error */}
            {apiError && (
              <div className="signup-error-banner" role="alert">
                <span>⚠️</span> {apiError}
              </div>
            )}

            {/* Success */}
            {successMsg && (
              <div className="signup-success-banner" role="status">
                <span>🎉</span> {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="signup-exact-form" noValidate>

              {/* Full Name */}
              <div>
                <div className={`signup-input-group-box ${errors.fullName ? 'has-error' : ''}`}>
                  <div className="signup-vertical-purple-bar"></div>
                  <input
                    type="text"
                    name="fullName"
                    id="signup-fullname"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Full Name"
                    autoComplete="name"
                    disabled={loading}
                  />
                </div>
                {errors.fullName && <p className="signup-field-error">{errors.fullName}</p>}
              </div>

              {/* Email */}
              <div>
                <div className={`signup-input-group-box ${errors.email ? 'has-error' : ''}`}>
                  <div className="signup-vertical-purple-bar"></div>
                  <input
                    type="email"
                    name="email"
                    id="signup-email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email Address"
                    autoComplete="email"
                    disabled={loading}
                  />
                </div>
                {errors.email && <p className="signup-field-error">{errors.email}</p>}
              </div>

              {/* Confirm Email */}
              <div>
                <div className={`signup-input-group-box ${errors.confirmEmail ? 'has-error' : ''}`}>
                  <div className="signup-vertical-purple-bar"></div>
                  <input
                    type="email"
                    name="confirmEmail"
                    id="signup-confirm-email"
                    value={formData.confirmEmail}
                    onChange={handleInputChange}
                    placeholder="Confirm Email"
                    autoComplete="email"
                    disabled={loading}
                  />
                </div>
                {errors.confirmEmail && <p className="signup-field-error">{errors.confirmEmail}</p>}
              </div>

              {/* Gender + Phone (side by side) */}
              <div className="signup-two-col">
                <div>
                  <div className={`signup-input-group-box ${errors.gender ? 'has-error' : ''}`}>
                    <div className="signup-vertical-purple-bar"></div>
                    <select
                      name="gender"
                      id="signup-gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="signup-custom-select"
                      disabled={loading}
                    >
                      <option value="" disabled hidden>Gender (Optional)</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>
                <div>
                  <div className="signup-input-group-box">
                    <div className="signup-vertical-purple-bar"></div>
                    <input
                      type="tel"
                      name="phone"
                      id="signup-phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Phone (Optional)"
                      autoComplete="tel"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <div className={`signup-input-group-box ${errors.password ? 'has-error' : ''}`}>
                  <div className="signup-vertical-purple-bar"></div>
                  <input
                    type="password"
                    name="password"
                    id="signup-password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Password (min 6 chars)"
                    autoComplete="new-password"
                    disabled={loading}
                  />
                </div>
                {errors.password && <p className="signup-field-error">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <div className={`signup-input-group-box ${errors.confirmPassword ? 'has-error' : ''}`}>
                  <div className="signup-vertical-purple-bar"></div>
                  <input
                    type="password"
                    name="confirmPassword"
                    id="signup-confirm-password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm Password"
                    autoComplete="new-password"
                    disabled={loading}
                  />
                </div>
                {errors.confirmPassword && <p className="signup-field-error">{errors.confirmPassword}</p>}
              </div>

              <button
                type="submit"
                className="signup-subscribe-action-btn"
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? 'جارٍ إنشاء الحساب…' : 'CREATE ACCOUNT'}
              </button>

              <div className="signup-login-link">
                <Link to="/login">Already have an account? Sign In →</Link>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
