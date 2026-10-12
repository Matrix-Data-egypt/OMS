import React from 'react';
import './PageHero.css';

/**
 * PageHero - هيدر موحد بصورة البانر لكل الصفحات
 * Props:
 *   badge    - النص الصغير فوق العنوان
 *   title    - العنوان الرئيسي (يقبل JSX)
 *   subtitle - الوصف تحت العنوان
 */
export default function PageHero({ badge, title, subtitle }) {
  return (
    <section className="page-hero-section">
      <div
        className="page-hero-banner-bg"
        style={{
          backgroundImage: `url(${process.env.PUBLIC_URL + '/hero-banner.png'})`,
        }}
      >
        <div className="page-hero-overlay" />
        <div className="page-hero-content">
          {badge && <span className="page-hero-badge">{badge}</span>}
          <h1 className="page-hero-title">{title}</h1>
          {subtitle && <p className="page-hero-subtitle">{subtitle}</p>}
        </div>
      </div>
    </section>
  );
}

