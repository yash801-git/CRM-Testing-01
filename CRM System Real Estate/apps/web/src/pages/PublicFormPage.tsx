import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export default function PublicFormPage() {
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get('campaignId') || '';
  const propertyId = searchParams.get('propertyId') || '';
  const source = searchParams.get('source') || 'CRM Ad Form';

  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [animateIn, setAnimateIn] = useState(false);

  const honeyRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => setAnimateIn(true), 50);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState('submitting');
    setErrorMsg('');

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const payload: Record<string, string> = {};
    formData.forEach((val, key) => { payload[key] = val.toString(); });

    // Attach URL context
    payload.campaignId = campaignId;
    payload.propertyId = propertyId;
    payload.source = source;

    try {
      const res = await fetch(`${API_BASE}/public/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Submission failed. Please try again.');
      }

      setFormState('success');
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
      setFormState('error');
    }
  };

  if (formState === 'success') {
    return (
      <div className="pfp-root">
        <div className="pfp-bg-anim" />
        <div className={`pfp-card pfp-success-card ${animateIn ? 'pfp-slide-in' : ''}`}>
          <div className="pfp-success-icon">
            <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="30" cy="30" r="30" fill="url(#sg)" />
              <path d="M18 31l9 9 16-16" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="sg" x1="0" y1="0" x2="60" y2="60" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="pfp-success-title">You're All Set! 🎉</h1>
          <p className="pfp-success-desc">
            Thank you for reaching out. Our team will contact you shortly to discuss
            the best properties matching your needs.
          </p>
          <div className="pfp-success-chips">
            <span className="pfp-chip pfp-chip-green">✓ Lead Registered</span>
            <span className="pfp-chip pfp-chip-blue">✓ Team Notified</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pfp-root">
      {/* Animated gradient background */}
      <div className="pfp-bg-anim" />

      {/* Floating decorative orbs */}
      <div className="pfp-orb pfp-orb-1" />
      <div className="pfp-orb pfp-orb-2" />
      <div className="pfp-orb pfp-orb-3" />

      <div className={`pfp-wrapper ${animateIn ? 'pfp-slide-in' : ''}`}>
        {/* Header branding */}
        <div className="pfp-brand">
          <div className="pfp-brand-logo">
            <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
              <rect width="36" height="36" rx="10" fill="url(#bl)" />
              <path d="M18 8L28 16v14H8V16L18 8z" fill="white" fillOpacity="0.9" />
              <rect x="14" y="22" width="8" height="8" rx="1" fill="url(#bl)" />
              <defs>
                <linearGradient id="bl" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="pfp-brand-name">EstateSync</span>
        </div>

        <div className="pfp-card">
          {/* Card header */}
          <div className="pfp-card-header">
            <div className="pfp-header-badge">🏡 Exclusive Property Inquiry</div>
            <h1 className="pfp-card-title">Find Your Dream Home</h1>
            <p className="pfp-card-subtitle">
              Fill in your details and our expert advisors will reach out within 24 hours
              with curated listings tailored just for you.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="pfp-form" noValidate>
            {/* Honeypot — hidden from real users, caught by validation */}
            <div style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }} aria-hidden="true">
              <input
                ref={honeyRef}
                type="text"
                name="honey"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {/* Full Name */}
            <div className={`pfp-field ${focusedField === 'name' ? 'pfp-field-focused' : ''}`}>
              <label htmlFor="pfp-name" className="pfp-label">
                <span className="pfp-label-icon">👤</span> Full Name *
              </label>
              <input
                id="pfp-name"
                name="name"
                type="text"
                placeholder="e.g. Rahul Sharma"
                className="pfp-input"
                required
                autoComplete="name"
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
              />
            </div>

            {/* Phone */}
            <div className={`pfp-field ${focusedField === 'phone' ? 'pfp-field-focused' : ''}`}>
              <label htmlFor="pfp-phone" className="pfp-label">
                <span className="pfp-label-icon">📱</span> Phone Number *
              </label>
              <input
                id="pfp-phone"
                name="phone"
                type="tel"
                placeholder="e.g. +91 98765 43210"
                className="pfp-input"
                required
                autoComplete="tel"
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
              />
            </div>

            {/* Email */}
            <div className={`pfp-field ${focusedField === 'email' ? 'pfp-field-focused' : ''}`}>
              <label htmlFor="pfp-email" className="pfp-label">
                <span className="pfp-label-icon">✉️</span> Email Address
              </label>
              <input
                id="pfp-email"
                name="email"
                type="email"
                placeholder="e.g. rahul@email.com"
                className="pfp-input"
                autoComplete="email"
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
            </div>

            {/* Budget */}
            <div className={`pfp-field ${focusedField === 'budget' ? 'pfp-field-focused' : ''}`}>
              <label htmlFor="pfp-budget" className="pfp-label">
                <span className="pfp-label-icon">💰</span> Budget (₹)
              </label>
              <input
                id="pfp-budget"
                name="budget"
                type="number"
                placeholder="e.g. 5000000"
                className="pfp-input"
                min="0"
                onFocus={() => setFocusedField('budget')}
                onBlur={() => setFocusedField(null)}
              />
            </div>

            {/* Message */}
            <div className={`pfp-field ${focusedField === 'notes' ? 'pfp-field-focused' : ''}`}>
              <label htmlFor="pfp-notes" className="pfp-label">
                <span className="pfp-label-icon">💬</span> Message / Requirements
              </label>
              <textarea
                id="pfp-notes"
                name="notes"
                placeholder="Tell us about your ideal property — location, size, amenities..."
                className="pfp-textarea"
                rows={3}
                onFocus={() => setFocusedField('notes')}
                onBlur={() => setFocusedField(null)}
              />
            </div>

            {/* Error message */}
            {formState === 'error' && (
              <div className="pfp-error-box">
                <span>⚠️</span> {errorMsg}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="pfp-btn-submit"
              disabled={formState === 'submitting'}
              id="pfp-submit-btn"
            >
              {formState === 'submitting' ? (
                <span className="pfp-spinner-wrap">
                  <span className="pfp-spinner" />
                  Sending your inquiry...
                </span>
              ) : (
                <span>Get Expert Consultation →</span>
              )}
            </button>

            <p className="pfp-privacy-note">
              🔒 Your information is private and never shared with third parties.
            </p>
          </form>
        </div>

        {/* Trust badges */}
        <div className="pfp-trust-row">
          <div className="pfp-trust-badge">
            <span>🏆</span> Trusted by 500+ Buyers
          </div>
          <div className="pfp-trust-badge">
            <span>⚡</span> 24hr Response
          </div>
          <div className="pfp-trust-badge">
            <span>🛡️</span> 100% Free Advice
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .pfp-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background: #0a0a14;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          padding: 24px 16px 48px;
        }

        .pfp-bg-anim {
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 20% 10%, rgba(99, 102, 241, 0.18) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 50% 50%, rgba(16, 16, 32, 0.95) 0%, transparent 100%),
            linear-gradient(135deg, #080812 0%, #0d0d1e 50%, #080812 100%);
          z-index: 0;
          animation: pfp-bg-shift 12s ease-in-out infinite alternate;
        }

        @keyframes pfp-bg-shift {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(20deg); }
        }

        .pfp-orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(60px);
          pointer-events: none;
          z-index: 0;
          animation: pfp-float 8s ease-in-out infinite alternate;
        }
        .pfp-orb-1 { width: 400px; height: 400px; background: rgba(99,102,241,0.12); top: -80px; left: -80px; animation-delay: 0s; }
        .pfp-orb-2 { width: 300px; height: 300px; background: rgba(139,92,246,0.10); bottom: 0; right: -60px; animation-delay: -3s; }
        .pfp-orb-3 { width: 200px; height: 200px; background: rgba(16,185,129,0.07); top: 50%; left: 60%; animation-delay: -6s; }

        @keyframes pfp-float {
          0% { transform: translateY(0px) scale(1); }
          100% { transform: translateY(-30px) scale(1.08); }
        }

        .pfp-wrapper {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 480px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }

        .pfp-slide-in {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }

        /* Brand header */
        .pfp-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .pfp-brand-logo {
          display: flex;
          align-items: center;
        }
        .pfp-brand-name {
          font-size: 20px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.5px;
        }

        /* Card */
        .pfp-card {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 28px;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          box-shadow:
            0 0 0 1px rgba(99,102,241,0.08),
            0 24px 64px rgba(0,0,0,0.5),
            inset 0 1px 0 rgba(255,255,255,0.06);
          overflow: hidden;
        }

        /* Card header */
        .pfp-card-header {
          padding: 32px 32px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.04) 100%);
        }

        .pfp-header-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #818cf8;
          background: rgba(99,102,241,0.15);
          border: 1px solid rgba(99,102,241,0.25);
          border-radius: 100px;
          padding: 4px 12px;
          margin-bottom: 14px;
        }

        .pfp-card-title {
          font-size: 28px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.8px;
          line-height: 1.2;
          margin: 0 0 10px;
        }

        .pfp-card-subtitle {
          font-size: 14px;
          color: rgba(255,255,255,0.5);
          line-height: 1.6;
          margin: 0;
          font-weight: 400;
        }

        /* Form */
        .pfp-form {
          padding: 24px 32px 28px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          position: relative;
        }

        .pfp-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
          transition: transform 0.2s ease;
        }

        .pfp-field-focused {
          transform: scale(1.005);
        }

        .pfp-label {
          font-size: 12px;
          font-weight: 700;
          color: rgba(255,255,255,0.5);
          letter-spacing: 0.04em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .pfp-label-icon {
          font-size: 13px;
        }

        .pfp-input, .pfp-textarea {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 13px 16px;
          font-size: 14px;
          font-weight: 500;
          color: #fff;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .pfp-input::placeholder, .pfp-textarea::placeholder {
          color: rgba(255,255,255,0.22);
        }

        .pfp-input:focus, .pfp-textarea:focus {
          border-color: rgba(99, 102, 241, 0.6);
          background: rgba(99, 102, 241, 0.07);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }

        .pfp-textarea {
          resize: vertical;
          min-height: 80px;
        }

        /* Error */
        .pfp-error-box {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 13px;
          font-weight: 500;
          color: #fca5a5;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Submit button */
        .pfp-btn-submit {
          width: 100%;
          padding: 16px;
          border-radius: 14px;
          border: none;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: #fff;
          font-size: 15px;
          font-weight: 700;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          cursor: pointer;
          transition: all 0.2s ease;
          letter-spacing: -0.2px;
          box-shadow: 0 4px 24px rgba(99,102,241,0.35);
          position: relative;
          overflow: hidden;
          margin-top: 4px;
        }

        .pfp-btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(99,102,241,0.45);
          background: linear-gradient(135deg, #5558e8 0%, #7c3aed 100%);
        }

        .pfp-btn-submit:active:not(:disabled) {
          transform: translateY(0);
        }

        .pfp-btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .pfp-spinner-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .pfp-spinner {
          width: 16px;
          height: 16px;
          border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: pfp-spin 0.7s linear infinite;
        }

        @keyframes pfp-spin {
          to { transform: rotate(360deg); }
        }

        .pfp-privacy-note {
          font-size: 12px;
          color: rgba(255,255,255,0.3);
          text-align: center;
          margin: 0;
          font-weight: 500;
        }

        /* Trust row */
        .pfp-trust-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .pfp-trust-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: rgba(255,255,255,0.4);
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 100px;
          padding: 6px 14px;
        }

        /* Success card */
        .pfp-success-card {
          max-width: 420px;
          margin: 0 auto;
          text-align: center;
          padding: 48px 40px;
        }

        .pfp-success-icon {
          width: 72px;
          height: 72px;
          margin: 0 auto 24px;
          animation: pfp-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes pfp-pop {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .pfp-success-title {
          font-size: 28px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.8px;
          margin: 0 0 12px;
        }

        .pfp-success-desc {
          font-size: 14px;
          color: rgba(255,255,255,0.5);
          line-height: 1.7;
          margin: 0 0 24px;
        }

        .pfp-success-chips {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .pfp-chip {
          font-size: 12px;
          font-weight: 700;
          border-radius: 100px;
          padding: 6px 14px;
        }

        .pfp-chip-green {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #6ee7b7;
        }

        .pfp-chip-blue {
          background: rgba(99, 102, 241, 0.15);
          border: 1px solid rgba(99, 102, 241, 0.3);
          color: #a5b4fc;
        }

        @media (max-width: 520px) {
          .pfp-card-header, .pfp-form { padding-left: 20px; padding-right: 20px; }
          .pfp-card-title { font-size: 22px; }
          .pfp-trust-row { gap: 8px; }
          .pfp-trust-badge { font-size: 11px; }
        }
      `}</style>
    </div>
  );
}
