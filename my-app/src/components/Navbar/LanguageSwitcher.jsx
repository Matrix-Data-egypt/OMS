import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './LanguageSwitcher.css';

export default function LanguageSwitcher() {
  const { language, changeLanguage, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Find the currently active language object
  const currentLang = languages.find((l) => l.code === language) || languages[0];

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelect = (code) => {
    changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="lang-dropdown-wrapper" ref={dropdownRef}>
      {/* Trigger Button: Shows Current Language + Down Arrow (سهم تحت) */}
      <button
        type="button"
        className={`lang-select-trigger ${isOpen ? 'is-active' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        title="اختر اللغة / Select Language"
      >
        <span className="lang-trigger-text">
          {currentLang.label}
        </span>
        {/* Down Arrow / سهم تحت */}
        <svg
          className={`lang-down-arrow ${isOpen ? 'is-rotated' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <ul className="lang-options-dropdown" role="listbox">
          {languages.map((item) => {
            const isSelected = item.code === language;
            return (
              <li key={item.code} role="none">
                <button
                  type="button"
                  className={`lang-option-item ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => handleSelect(item.code)}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span className="lang-opt-name">{item.name}</span>
                  <span className="lang-opt-badge">{item.label}</span>
                  {isSelected && (
                    <span className="lang-opt-check" aria-hidden="true">✓</span>
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
