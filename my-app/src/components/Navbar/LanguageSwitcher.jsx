import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './LanguageSwitcher.css';

export default function LanguageSwitcher() {
  const { language, changeLanguage, languages, currentLangMeta } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code) => {
    changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="lang-switcher-container" ref={dropdownRef}>
      <button
        type="button"
        className={`lang-trigger-btn ${isOpen ? 'is-active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        title="Change Language / تغيير اللغة / Changer de langue"
      >
        {/* Animated 3D Spinning Earth Globe Icon Only */}
        <div className="earth-globe-wrapper" aria-hidden="true">
          <div className="earth-globe-sphere">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="earth-globe-svg"
            >
              {/* Outer globe circle */}
              <circle cx="12" cy="12" r="10" className="globe-circle" />
              {/* Meridian and Latitude lines simulating 3D rotation */}
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" className="globe-meridian" />
              <path d="M2 12h20" className="globe-equator" />
              <path d="M4.5 7h15" className="globe-parallel-north" />
              <path d="M4.5 17h15" className="globe-parallel-south" />
            </svg>
            <span className="earth-globe-glow"></span>
          </div>
        </div>
      </button>

      {/* Floating Glassmorphic Dropdown */}
      {isOpen && (
        <ul className="lang-dropdown-menu" role="listbox">
          <li className="lang-dropdown-header">
            <span>🌐 Select Language</span>
          </li>
          {languages.map((item) => {
            const isSelected = item.code === language;
            return (
              <li key={item.code}>
                <button
                  type="button"
                  className={`lang-option-btn ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => handleSelect(item.code)}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span className="lang-option-flag">{item.flag}</span>
                  <span className="lang-option-name">{item.name}</span>
                  <span className="lang-option-badge">{item.label}</span>
                  {isSelected && (
                    <span className="lang-check-icon" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
