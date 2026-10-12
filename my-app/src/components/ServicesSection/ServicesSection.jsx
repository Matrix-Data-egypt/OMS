import React from 'react';
import { Link } from 'react-router-dom';
import './ServicesSection.css';
import PageHero from '../PageHero/PageHero';

export default function ServicesSection() {
  return (
    <div className="services-page-container">
      {/* الخلفية المضيئة الدقيقة للأنيميشن */}
      <div className="services-ambient-glow" aria-hidden="true" />
      
      {/* === Banner Hero === */}
      <PageHero
        badge="OMS Core Competencies"
        title={<>Our Strategic <span>Services.</span></>}
        subtitle="Explore our fully-integrated tactical marketing frameworks engineered around absolute data discipline and concrete commercial revenue creation."
      />

      {/* === الجزء الثاني: شبكة تفاصيل الخدمات === */}
      <section className="services-grid-wrapper">
        
        {/* المجموعة الأولى: Traditional Marketing */}
        <div className="service-category-block traditional-category">
          <div className="category-block-header">
            <div className="category-title-row">
              <span className="category-num-tag">01 / CAPABILITY</span>
              <h2>Traditional Marketing</h2>
            </div>
            <ul className="mini-services-list">
              <li>Media Buying &quot;TV &amp; Radio&quot;</li>
              <li>Production</li>
              <li>Indoor &amp; Outdoor Adv.</li>
              <li>PR &quot;Booths &amp; Events&quot;</li>
              <li>Designs &amp; Printing Services</li>
              <li>CI &amp; Branding</li>
              <li>Digital Marketing &amp; Social Media</li>
              <li>BTL</li>
            </ul>
          </div>

          <div className="detailed-subservices-grid">
            <div className="subservice-detailed-card">
              <div className="subservice-card-accent" />
              <h3>Branding</h3>
              <p>
                Your brand is not a product, a website, a logo or your company name. It&apos;s a hard-to-pin-down feeling. It&apos;s also the thing that separates a mediocre brand from a great one. At OMS, we will work with you to develop a comprehensive brand strategy that helps position your company, and ensure that it stands out and remains memorable in the mind of the consumer.
              </p>
            </div>

            <div className="subservice-detailed-card">
              <div className="subservice-card-accent" />
              <h3>Indoor &amp; Outdoor Advertising</h3>
              <p>
                The presence of indoor &amp; outdoor advertising continually reaches consumers where they live, work, shop and play to deliver your marketing/promotional message as they travel throughout their daily life. With repeated familiarity, exposure and retention, OMS will help you reach your targeted audience to make a choice at the point of decision.
              </p>
            </div>

            <div className="subservice-detailed-card">
              <div className="subservice-card-accent" />
              <h3>PR &quot;Booths &amp; Events&quot;</h3>
              <p>
                Our wealth of PR experience and know-how, combined with our addiction to perfection, means great things for your business. We love to build fruitful relationships with our clients, using our tried-and-true business processes, excellent communication, and red carpet treatment.
              </p>
            </div>

            <div className="subservice-detailed-card">
              <div className="subservice-card-accent" />
              <h3>Media Buying &quot;TV &amp; Radio&quot;</h3>
              <p>
                Media planning and buying is at the heart of everything we do. We have the wealth of experience needed to expertly guide our clients through the maze of media options and innovative technology solutions existing in the market.
              </p>
            </div>

            <div className="subservice-detailed-card">
              <div className="subservice-card-accent" />
              <h3>Designs &amp; Printing Services</h3>
              <p>
                Create a personality for your products with customized designs that reflect your brand identity and core values. Your printed marketing materials are the only remnants of your company that are left behind to your customers. Make sure that they pass the test.
              </p>
            </div>
          </div>
        </div>

        {/* المجموعة الثانية: Digital Marketing */}
        <div className="service-category-block digital-category">
          <div className="category-block-header">
            <div className="category-title-row">
              <span className="category-num-tag">02 / CAPABILITY</span>
              <h2>Digital Marketing</h2>
            </div>
            <ul className="mini-services-list">
              <li>Website Design &amp; Development</li>
              <li>Social Media &amp; Management</li>
              <li>Digital Media &amp; Buying</li>
              <li>Creative Concept</li>
              <li>SMS / LBA Campaigns</li>
            </ul>
          </div>

          <div className="detailed-subservices-grid">
            <div className="subservice-detailed-card">
              <div className="subservice-card-accent" />
              <h3>Web Design &amp; Development</h3>
              <p>
                Website design is more than just beautiful images, it tells your audience a story, conveys your brand personality, engages and informs the user while at the same time inspiring them to take action. With OMS, custom website designs with strategic insights are created to generate greater brand engagement, higher conversions and measurable results.
              </p>
            </div>

            <div className="subservice-detailed-card">
              <div className="subservice-card-accent" />
              <h3>Social Media Management</h3>
              <p>
                Social media marketing is essential for a successful online marketing strategy. At OMS, we don&apos;t do planning only, we do Management as well! Social Media Management can help you better understand the tools available to you, the benefits of the different networks, and most importantly, help you plan and execute your social media strategy accordingly with 24H service.
              </p>
            </div>

            <div className="subservice-detailed-card">
              <div className="subservice-card-accent" />
              <h3>Digital Media Buying</h3>
              <p>
                Through an extensive network of partners and suppliers, OMS offers a wide array of digital advertising media to promote any campaign communicating effectively for your target audience such as Google Adwords, FB Ads, Youtube, High traffic Websites, Bloggers and influencers &amp; a lot more...
              </p>
            </div>

            <div className="subservice-detailed-card">
              <div className="subservice-card-accent" />
              <h3>Creative Concept</h3>
              <p>
                We believe that the idea is the center of an organization&apos;s universe, and it should be thoughtfully developed, nurtured, tracked and amplified to positively differentiate and position it in the market. At OMS, we work with organizations both new and renowned to discover special qualities, shape experiences, and evoke the brand&apos;s essence at every touch point.
              </p>
            </div>

            <div className="subservice-detailed-card">
              <div className="subservice-card-accent" />
              <h3>SMS / LBA Campaigns</h3>
              <p>
                We deliver the solutions that prepare our clients to meet the demands and seize the opportunities that mobile presents. At OMS, we take advantage of Geographic location (Location Based Advertisement) and user history to deliver an engaging personalized SMS campaigns and much more.
              </p>
            </div>
          </div>
        </div>

      </section>

      {/* === الجزء الثالث: الـ Pitch النهائي وعقد المشاريع === */}
      <section className="services-cta-pitch">
        <div className="pitch-content-wrap">
          <h3>Have a project that requires full-scale integrated execution?</h3>
          <p>
            Deploy our tactical squads directly into your pipeline. Zero translation loss, pure data-backed performance velocity.
          </p>
          <Link to="/contact" className="initiate-architect-btn">
            Initiate Project Brief Architect →
          </Link>
        </div>
      </section>

    </div>
  );
}
