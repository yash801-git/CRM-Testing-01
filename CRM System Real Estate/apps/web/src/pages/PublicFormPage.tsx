import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fireViewContentEvent, fireInitiateCheckoutEvent, fireLeadEvent } from '../utils/pixel';
import { fireGoogleViewEvent, fireGoogleLeadEvent } from '../utils/google-tag';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

type FormState = 'idle' | 'submitting' | 'success' | 'error';
type Step = 1 | 2;

export default function PublicFormPage() {
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get('campaignId') || '';
  const propertyId = searchParams.get('propertyId') || '';
  const source = searchParams.get('source') || 'CRM Ad Form';

  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [animateIn, setAnimateIn] = useState(false);
  
  const [step, setStep] = useState<Step>(1);
  const [propertyDetails, setPropertyDetails] = useState<any>(null);

  // Form Data State
  const [formData, setFormData] = useState({
    propertyType: '',
    bhk: '',
    purpose: '',
    timeline: '',
    requiresLoan: false,
    name: '',
    phone: '',
    email: '',
    budget: '',
    notes: ''
  });

  const honeyRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => setAnimateIn(true), 50);

    // Track click/view natively if campaignId exists
    if (campaignId) {
      const sessionKey = `tracked_view_${campaignId}_${source}`;
      if (!sessionStorage.getItem(sessionKey)) {
        fetch(`${API_BASE}/public/campaigns/${campaignId}/click`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ source })
        }).catch(err => console.error("Tracking failed", err));
        sessionStorage.setItem(sessionKey, 'true');
      }
    }

    // Fire Meta Pixel ViewContent event
    fireViewContentEvent({
      source,
      campaignId,
      propertyTitle: propertyDetails?.title,
    });

    // Fire Google Tag View event
    fireGoogleViewEvent({
      source,
      campaignId,
      propertyTitle: propertyDetails?.title,
    });

    if (propertyId) {
      fetch(`${API_BASE}/public/properties/${propertyId}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setPropertyDetails(data);
            if (data.type) {
              // Map DB Enum (e.g. 'VILLA', 'HOUSE') to form expected value ('Villa', 'House')
              const mappedType = data.type === 'HOUSE' ? 'House' : 
                                 data.type === 'PLOT' ? 'Plot' : 
                                 data.type.charAt(0).toUpperCase() + data.type.slice(1).toLowerCase();
              setFormData(prev => ({ ...prev, propertyType: mappedType }));
            }
          }
        })
        .catch(err => console.error("Failed to load property details", err));
    }
  }, [propertyId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => {
        const newData = { ...prev, [name]: value };
        if (name === 'propertyType' && !['Apartment', 'Villa', 'House', ''].includes(value)) {
          newData.bhk = '';
        }
        return newData;
      });
    }
  };

  const isResidential = ['Apartment', 'Villa', 'House', ''].includes(formData.propertyType);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    // Fire Meta Pixel InitiateCheckout when user moves to Step 2
    fireInitiateCheckoutEvent();
    setStep(2);
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState('submitting');
    setErrorMsg('');

    // Honeypot check
    if (honeyRef.current && honeyRef.current.value) {
      setFormState('success'); // Fake success for bots
      return;
    }

    const payload = {
      ...formData,
      campaignId,
      propertyId,
      source
    };

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
      // Fire Meta Pixel Lead event on successful submission
      fireLeadEvent({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        source,
      });

      // Fire Google Tag Lead event on successful submission
      fireGoogleLeadEvent({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        source,
      });
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
            the best options tailored just for you.
          </p>
          <div className="pfp-success-chips">
            <span className="pfp-chip pfp-chip-green">✓ Details Received</span>
            <span className="pfp-chip pfp-chip-blue">✓ Team Notified</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pfp-root">
      <div className="pfp-bg-anim" />
      <div className="pfp-orb pfp-orb-1" />
      <div className="pfp-orb pfp-orb-2" />
      <div className="pfp-orb pfp-orb-3" />

      <div className={`pfp-wrapper ${animateIn ? 'pfp-slide-in' : ''}`}>
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
          {propertyDetails ? (
            <div className="pfp-property-banner">
              {propertyDetails.images?.[0] ? (
                <div className="pfp-property-image" style={{ backgroundImage: `url(${propertyDetails.images[0]})` }}>
                  <div className="pfp-property-overlay">
                    <span className="pfp-property-badge">Featured Property</span>
                    <h2 className="pfp-property-title">{propertyDetails.title}</h2>
                    <p className="pfp-property-location">📍 {propertyDetails.city}, {propertyDetails.state}</p>
                    <p className="pfp-property-price">₹{Number(propertyDetails.price).toLocaleString()}</p>
                  </div>
                </div>
              ) : (
                <div className="pfp-property-header-simple">
                   <span className="pfp-property-badge">Featured Property</span>
                   <h2 className="pfp-property-title">{propertyDetails.title}</h2>
                   <p className="pfp-property-location">📍 {propertyDetails.city}, {propertyDetails.state} • ₹{Number(propertyDetails.price).toLocaleString()}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="pfp-card-header">
              <div className="pfp-header-badge">🏡 Exclusive Property Inquiry</div>
              <h1 className="pfp-card-title">Find Your Dream Home</h1>
              <p className="pfp-card-subtitle">
                Complete this quick 2-step form to help us find exactly what you're looking for.
              </p>
            </div>
          )}

          <div className="pfp-progress">
            <div className={`pfp-progress-bar ${step === 2 ? 'pfp-progress-full' : 'pfp-progress-half'}`} />
          </div>

          <form onSubmit={step === 1 ? handleNextStep : handleSubmit} className="pfp-form" noValidate>
            <div style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }} aria-hidden="true">
              <input ref={honeyRef} type="text" name="honey" tabIndex={-1} autoComplete="off" />
            </div>

            {step === 1 && (
              <div className="pfp-step-content fade-in">
                <h3 className="pfp-step-title">Step 1: Your Requirements</h3>
                
                <div className={`pfp-field ${focusedField === 'propertyType' ? 'pfp-field-focused' : ''}`}>
                  <label htmlFor="pfp-propertyType" className="pfp-label">
                    <span className="pfp-label-icon">🏢</span> Property Type
                    {propertyDetails?.type && <span style={{ fontSize: '9px', marginLeft: 'auto', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>LOCKED</span>}
                  </label>
                  <select 
                    id="pfp-propertyType" 
                    name="propertyType" 
                    value={formData.propertyType} 
                    onChange={handleInputChange} 
                    disabled={!!propertyDetails?.type}
                    className={`pfp-input ${!!propertyDetails?.type ? 'opacity-50 cursor-not-allowed' : ''}`} 
                    onFocus={() => setFocusedField('propertyType')} 
                    onBlur={() => setFocusedField(null)}
                  >
                    <option value="" disabled>Select property type</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Villa">Villa</option>
                    <option value="House">Independent House</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Plot">Plot / Land</option>
                  </select>
                </div>

                {isResidential && (
                  <div className={`pfp-field ${focusedField === 'bhk' ? 'pfp-field-focused' : ''}`}>
                    <label htmlFor="pfp-bhk" className="pfp-label"><span className="pfp-label-icon">🛏️</span> Size Requirement</label>
                    <select id="pfp-bhk" name="bhk" value={formData.bhk} onChange={handleInputChange} className="pfp-input" onFocus={() => setFocusedField('bhk')} onBlur={() => setFocusedField(null)}>
                      <option value="" disabled>Select BHK</option>
                      <option value="1 BHK">1 BHK</option>
                      <option value="2 BHK">2 BHK</option>
                      <option value="3 BHK">3 BHK</option>
                      <option value="4+ BHK">4+ BHK</option>
                    </select>
                  </div>
                )}

                <div className="pfp-field">
                  <label className="pfp-label"><span className="pfp-label-icon">🎯</span> Purpose of Buying</label>
                  <div className="pfp-radio-group">
                    <label className={`pfp-radio-card ${formData.purpose === 'Personal Use' ? 'pfp-radio-selected' : ''}`}>
                      <input type="radio" name="purpose" value="Personal Use" checked={formData.purpose === 'Personal Use'} onChange={handleInputChange} />
                      <span className="pfp-radio-text">Personal Use</span>
                    </label>
                    <label className={`pfp-radio-card ${formData.purpose === 'Investment' ? 'pfp-radio-selected' : ''}`}>
                      <input type="radio" name="purpose" value="Investment" checked={formData.purpose === 'Investment'} onChange={handleInputChange} />
                      <span className="pfp-radio-text">Investment</span>
                    </label>
                  </div>
                </div>

                <div className={`pfp-field ${focusedField === 'timeline' ? 'pfp-field-focused' : ''}`}>
                  <label htmlFor="pfp-timeline" className="pfp-label"><span className="pfp-label-icon">⏳</span> Purchasing Timeline</label>
                  <select id="pfp-timeline" name="timeline" value={formData.timeline} onChange={handleInputChange} className="pfp-input" onFocus={() => setFocusedField('timeline')} onBlur={() => setFocusedField(null)}>
                    <option value="" disabled>When do you plan to buy?</option>
                    <option value="Immediately">Immediately</option>
                    <option value="1-3 Months">Within 1 to 3 Months</option>
                    <option value="3-6 Months">3 to 6 Months</option>
                    <option value="Just Exploring">Just Exploring</option>
                  </select>
                </div>

                <div className="pfp-toggle-box">
                  <label className="pfp-toggle-label">
                    <div className="pfp-toggle-text">
                      <span className="pfp-toggle-title">🏦 Need Home Loan Assistance?</span>
                      <span className="pfp-toggle-desc">Get connected with our banking partners for fast pre-approvals.</span>
                    </div>
                    <div className="pfp-switch">
                      <input type="checkbox" name="requiresLoan" checked={formData.requiresLoan} onChange={handleInputChange} />
                      <span className="pfp-slider"></span>
                    </div>
                  </label>
                </div>

                <button type="submit" className="pfp-btn-submit">
                  <span>Next Step →</span>
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="pfp-step-content fade-in">
                <h3 className="pfp-step-title">Step 2: Contact Details</h3>

                <div className={`pfp-field ${focusedField === 'name' ? 'pfp-field-focused' : ''}`}>
                  <label htmlFor="pfp-name" className="pfp-label"><span className="pfp-label-icon">👤</span> Full Name *</label>
                  <input id="pfp-name" name="name" type="text" value={formData.name} onChange={handleInputChange} placeholder="e.g. Rahul Sharma" className="pfp-input" required onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)} />
                </div>

                <div className={`pfp-field ${focusedField === 'phone' ? 'pfp-field-focused' : ''}`}>
                  <label htmlFor="pfp-phone" className="pfp-label"><span className="pfp-label-icon">📱</span> Phone Number *</label>
                  <input id="pfp-phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="e.g. +91 98765 43210" className="pfp-input" required onFocus={() => setFocusedField('phone')} onBlur={() => setFocusedField(null)} />
                </div>

                <div className={`pfp-field ${focusedField === 'email' ? 'pfp-field-focused' : ''}`}>
                  <label htmlFor="pfp-email" className="pfp-label"><span className="pfp-label-icon">✉️</span> Email Address</label>
                  <input id="pfp-email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="e.g. rahul@email.com" className="pfp-input" onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} />
                </div>

                <div className={`pfp-field ${focusedField === 'budget' ? 'pfp-field-focused' : ''}`}>
                  <label htmlFor="pfp-budget" className="pfp-label"><span className="pfp-label-icon">💰</span> Budget (₹)</label>
                  <input id="pfp-budget" name="budget" type="number" value={formData.budget} onChange={handleInputChange} placeholder="e.g. 5000000" className="pfp-input" min="0" onFocus={() => setFocusedField('budget')} onBlur={() => setFocusedField(null)} />
                </div>

                <div className={`pfp-field ${focusedField === 'notes' ? 'pfp-field-focused' : ''}`}>
                  <label htmlFor="pfp-notes" className="pfp-label"><span className="pfp-label-icon">💬</span> Message (Optional)</label>
                  <textarea id="pfp-notes" name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Any specific requirements?" className="pfp-textarea" rows={2} onFocus={() => setFocusedField('notes')} onBlur={() => setFocusedField(null)} />
                </div>

                {formState === 'error' && (
                  <div className="pfp-error-box"><span>⚠️</span> {errorMsg}</div>
                )}

                <div className="pfp-button-group">
                  <button type="button" onClick={handlePrevStep} className="pfp-btn-back">← Back</button>
                  <button type="submit" className="pfp-btn-submit pfp-btn-flex" disabled={formState === 'submitting'}>
                    {formState === 'submitting' ? (
                      <span className="pfp-spinner-wrap"><span className="pfp-spinner" /> Sending...</span>
                    ) : (
                      <span>Get Expert Consultation</span>
                    )}
                  </button>
                </div>
              </div>
            )}
            
            <p className="pfp-privacy-note">🔒 Your information is private and never shared.</p>
          </form>
        </div>

        <div className="pfp-trust-row">
          <div className="pfp-trust-badge"><span>🏆</span> Trusted Experts</div>
          <div className="pfp-trust-badge"><span>⚡</span> Fast Response</div>
          <div className="pfp-trust-badge"><span>🛡️</span> 100% Free Advice</div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .pfp-root { min-height: 100vh; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; background: #0a0a14; font-family: 'Plus Jakarta Sans', sans-serif; padding: 24px 16px 48px; }
        .pfp-bg-anim { position: fixed; inset: 0; background: radial-gradient(ellipse 80% 60% at 20% 10%, rgba(99, 102, 241, 0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 50% 50%, rgba(16, 16, 32, 0.95) 0%, transparent 100%), linear-gradient(135deg, #080812 0%, #0d0d1e 50%, #080812 100%); z-index: 0; animation: pfp-bg-shift 12s ease-in-out infinite alternate; }
        @keyframes pfp-bg-shift { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(20deg); } }
        .pfp-orb { position: fixed; border-radius: 50%; filter: blur(60px); pointer-events: none; z-index: 0; animation: pfp-float 8s ease-in-out infinite alternate; }
        .pfp-orb-1 { width: 400px; height: 400px; background: rgba(99,102,241,0.12); top: -80px; left: -80px; animation-delay: 0s; }
        .pfp-orb-2 { width: 300px; height: 300px; background: rgba(139,92,246,0.10); bottom: 0; right: -60px; animation-delay: -3s; }
        .pfp-orb-3 { width: 200px; height: 200px; background: rgba(16,185,129,0.07); top: 50%; left: 60%; animation-delay: -6s; }
        @keyframes pfp-float { 0% { transform: translateY(0px) scale(1); } 100% { transform: translateY(-30px) scale(1.08); } }
        .pfp-wrapper { position: relative; z-index: 1; width: 100%; max-width: 480px; display: flex; flex-direction: column; align-items: center; gap: 20px; opacity: 0; transform: translateY(24px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .pfp-slide-in { opacity: 1 !important; transform: translateY(0) !important; }
        
        .pfp-brand { display: flex; align-items: center; gap: 10px; }
        .pfp-brand-logo { display: flex; align-items: center; }
        .pfp-brand-name { font-size: 20px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
        
        .pfp-card { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09); border-radius: 28px; backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); box-shadow: 0 0 0 1px rgba(99,102,241,0.08), 0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06); overflow: hidden; transition: all 0.3s ease; }
        
        /* Property Banner */
        .pfp-property-banner { border-bottom: 1px solid rgba(255,255,255,0.06); }
        .pfp-property-image { height: 180px; background-size: cover; background-position: center; position: relative; display: flex; flex-direction: column; justify-content: flex-end; }
        .pfp-property-overlay { background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 60%, transparent 100%); padding: 24px; }
        .pfp-property-header-simple { padding: 32px 32px 24px; background: linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.04) 100%); border-bottom: 1px solid rgba(255,255,255,0.06); }
        .pfp-property-badge { display: inline-block; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #fff; background: #6366f1; padding: 4px 10px; border-radius: 100px; margin-bottom: 8px; }
        .pfp-property-title { font-size: 24px; font-weight: 800; color: #fff; line-height: 1.2; margin: 0 0 6px; letter-spacing: -0.5px; }
        .pfp-property-location { font-size: 13px; color: rgba(255,255,255,0.7); font-weight: 500; margin: 0 0 4px; }
        .pfp-property-price { font-size: 18px; font-weight: 800; color: #6ee7b7; margin: 0; }

        .pfp-card-header { padding: 32px 32px 24px; border-bottom: 1px solid rgba(255,255,255,0.06); background: linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.04) 100%); }
        .pfp-header-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #818cf8; background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.25); border-radius: 100px; padding: 4px 12px; margin-bottom: 14px; }
        .pfp-card-title { font-size: 26px; font-weight: 800; color: #fff; letter-spacing: -0.8px; line-height: 1.2; margin: 0 0 10px; }
        .pfp-card-subtitle { font-size: 14px; color: rgba(255,255,255,0.5); line-height: 1.5; margin: 0; font-weight: 400; }
        
        .pfp-progress { width: 100%; height: 3px; background: rgba(255,255,255,0.05); }
        .pfp-progress-bar { height: 100%; background: linear-gradient(90deg, #6366f1, #8b5cf6); transition: width 0.4s ease; }
        .pfp-progress-half { width: 50%; }
        .pfp-progress-full { width: 100%; }

        .pfp-form { padding: 24px 32px 28px; position: relative; }
        .pfp-step-content { display: flex; flex-direction: column; gap: 16px; }
        .fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .pfp-step-title { font-size: 16px; font-weight: 700; color: #fff; margin: 0 0 4px; letter-spacing: -0.3px; }
        .pfp-field { display: flex; flex-direction: column; gap: 7px; transition: transform 0.2s ease; }
        .pfp-field-focused { transform: scale(1.005); }
        .pfp-label { font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.5); letter-spacing: 0.04em; text-transform: uppercase; display: flex; align-items: center; gap: 6px; }
        .pfp-label-icon { font-size: 13px; }
        .pfp-input, .pfp-textarea { width: 100%; background: rgba(255,255,255,0.05); border: 1.5px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 13px 16px; font-size: 14px; font-weight: 500; color: #fff; font-family: 'Plus Jakarta Sans', sans-serif; outline: none; transition: all 0.2s ease; box-sizing: border-box; }
        .pfp-input > option { background: #1a1a2e; color: #fff; }
        .pfp-input::placeholder, .pfp-textarea::placeholder { color: rgba(255,255,255,0.22); }
        .pfp-input:focus, .pfp-textarea:focus { border-color: rgba(99, 102, 241, 0.6); background: rgba(99, 102, 241, 0.07); box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
        .pfp-textarea { resize: vertical; min-height: 70px; }

        /* Radio Group */
        .pfp-radio-group { display: flex; gap: 10px; }
        .pfp-radio-card { flex: 1; background: rgba(255,255,255,0.05); border: 1.5px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px; text-align: center; cursor: pointer; transition: all 0.2s ease; }
        .pfp-radio-card input { display: none; }
        .pfp-radio-text { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.6); }
        .pfp-radio-selected { background: rgba(99, 102, 241, 0.15); border-color: #6366f1; }
        .pfp-radio-selected .pfp-radio-text { color: #fff; }

        /* Toggle Box for Loan */
        .pfp-toggle-box { background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.15); border-radius: 14px; padding: 16px; margin-top: 4px; }
        .pfp-toggle-label { display: flex; align-items: center; justify-content: space-between; cursor: pointer; gap: 12px; }
        .pfp-toggle-text { display: flex; flex-direction: column; gap: 4px; }
        .pfp-toggle-title { font-size: 13px; font-weight: 700; color: #fff; }
        .pfp-toggle-desc { font-size: 11px; color: rgba(255,255,255,0.5); line-height: 1.3; }
        .pfp-switch { position: relative; width: 44px; height: 24px; flex-shrink: 0; }
        .pfp-switch input { opacity: 0; width: 0; height: 0; }
        .pfp-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(255,255,255,0.1); transition: .3s; border-radius: 34px; border: 1px solid rgba(255,255,255,0.1); }
        .pfp-slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 2px; bottom: 2px; background-color: white; transition: .3s; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
        .pfp-switch input:checked + .pfp-slider { background-color: #10b981; border-color: #10b981; }
        .pfp-switch input:checked + .pfp-slider:before { transform: translateX(20px); }

        .pfp-error-box { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 12px 16px; font-size: 13px; font-weight: 500; color: #fca5a5; display: flex; align-items: center; gap: 8px; }
        
        .pfp-button-group { display: flex; gap: 12px; margin-top: 8px; }
        .pfp-btn-back { padding: 14px 20px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
        .pfp-btn-back:hover { background: rgba(255,255,255,0.1); }
        .pfp-btn-submit { width: 100%; padding: 16px; border-radius: 14px; border: none; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #fff; font-size: 15px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.2s ease; letter-spacing: -0.2px; box-shadow: 0 4px 24px rgba(99,102,241,0.35); margin-top: 8px; }
        .pfp-btn-flex { flex: 1; margin-top: 0; }
        .pfp-btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(99,102,241,0.45); }
        .pfp-btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }

        .pfp-spinner-wrap { display: flex; align-items: center; justify-content: center; gap: 10px; }
        .pfp-spinner { width: 16px; height: 16px; border: 2.5px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: pfp-spin 0.7s linear infinite; }
        @keyframes pfp-spin { to { transform: rotate(360deg); } }
        
        .pfp-privacy-note { font-size: 12px; color: rgba(255,255,255,0.3); text-align: center; margin: 16px 0 0; font-weight: 500; }
        .pfp-trust-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; justify-content: center; }
        .pfp-trust-badge { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.4); background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 100px; padding: 6px 14px; }
        
        .pfp-success-card { max-width: 420px; margin: 0 auto; text-align: center; padding: 48px 40px; }
        .pfp-success-icon { width: 72px; height: 72px; margin: 0 auto 24px; animation: pfp-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
        @keyframes pfp-pop { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .pfp-success-title { font-size: 28px; font-weight: 800; color: #fff; letter-spacing: -0.8px; margin: 0 0 12px; }
        .pfp-success-desc { font-size: 14px; color: rgba(255,255,255,0.5); line-height: 1.7; margin: 0 0 24px; }
        .pfp-success-chips { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
        .pfp-chip { font-size: 12px; font-weight: 700; border-radius: 100px; padding: 6px 14px; }
        .pfp-chip-green { background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #6ee7b7; }
        .pfp-chip-blue { background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); color: #a5b4fc; }

        @media (max-width: 520px) {
          .pfp-property-overlay, .pfp-property-header-simple, .pfp-card-header, .pfp-form { padding-left: 20px; padding-right: 20px; }
          .pfp-property-title { font-size: 20px; }
          .pfp-card-title { font-size: 22px; }
          .pfp-trust-row { gap: 8px; }
          .pfp-trust-badge { font-size: 11px; }
        }
      `}</style>
    </div>
  );
}
