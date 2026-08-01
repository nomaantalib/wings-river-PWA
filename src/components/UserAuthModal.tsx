'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Phone, Lock, CheckCircle2, ShieldCheck, RefreshCw, User, LogOut, ArrowRight, Sparkles, KeyRound, Mail, Smartphone } from 'lucide-react';

export interface UserSession {
  phone: string;
  name: string;
  email?: string;
  loggedIn: boolean;
  loggedInAt: string;
}

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: UserSession) => void;
}

export function getStoredUserSession(): UserSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('wings_user_session');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveUserSession(session: UserSession) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('wings_user_session', JSON.stringify(session));
  window.dispatchEvent(new Event('wings_auth_change'));
}

export function clearUserSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('wings_user_session');
  window.dispatchEvent(new Event('wings_auth_change'));
}

export default function UserAuthModal({ isOpen, onClose, onSuccess }: UserAuthModalProps) {
  const [step, setStep] = useState<'phone' | 'otp' | 'profile'>('phone');
  const [phoneInput, setPhoneInput] = useState('');
  const [otpInput, setOtpInput] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend Timer countdown
  useEffect(() => {
    if (step !== 'otp' || resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  if (!isOpen) return null;

  // Handle Send OTP
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneInput.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    setErrorMsg('');
    setIsSendingOtp(true);

    setTimeout(() => {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      setGeneratedOtp(code);
      setIsSendingOtp(false);
      setStep('otp');
      setResendTimer(30);

      // Auto-focus first box
      setTimeout(() => otpRefs.current[0]?.focus(), 150);
    }, 600);
  };

  // One-click Auto Fill Demo OTP
  const handleAutoFillDemoOtp = () => {
    if (!generatedOtp) return;
    const digits = generatedOtp.split('');
    setOtpInput(digits);
    setErrorMsg('');
  };

  // Handle OTP digit changes
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpInput];
    newOtp[index] = value.slice(-1);
    setOtpInput(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  // Handle OTP backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpInput[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = otpInput.join('');
    if (enteredCode.length !== 6) {
      setErrorMsg('Please enter the 6-digit OTP code');
      return;
    }

    if (enteredCode !== generatedOtp && enteredCode !== '123456') {
      setErrorMsg(`Invalid OTP code. Click 'Auto-Fill Demo OTP' to test.`);
      return;
    }

    setErrorMsg('');
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      const existingSession = getStoredUserSession();
      if (existingSession?.name) {
        const session: UserSession = {
          phone: phoneInput.replace(/\D/g, ''),
          name: existingSession.name,
          email: existingSession.email,
          loggedIn: true,
          loggedInAt: new Date().toISOString(),
        };
        saveUserSession(session);
        if (onSuccess) onSuccess(session);
        onClose();
      } else {
        setStep('profile');
      }
    }, 600);
  };

  // Handle Profile Submission
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = nameInput.trim() || `Customer ${phoneInput.slice(-4)}`;
    const session: UserSession = {
      phone: phoneInput.replace(/\D/g, ''),
      name,
      email: emailInput.trim(),
      loggedIn: true,
      loggedInAt: new Date().toISOString(),
    };
    saveUserSession(session);
    if (onSuccess) onSuccess(session);
    onClose();
  };

  // Resend OTP
  const handleResendOtp = () => {
    if (resendTimer > 0) return;
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(code);
    setResendTimer(30);
    setOtpInput(['', '', '', '', '', '']);
    setErrorMsg('');
    otpRefs.current[0]?.focus();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#0B0C0E]/95 backdrop-blur-2xl flex items-center justify-center p-4">
      {/* Ambient Background Glows */}
      <div className="absolute w-96 h-96 bg-[#C9B086]/15 rounded-full blur-3xl pointer-events-none -top-20 -left-20" />
      <div className="absolute w-96 h-96 bg-[#98A886]/15 rounded-full blur-3xl pointer-events-none -bottom-20 -right-20" />

      <div className="relative w-full max-w-md bg-[#14171D] rounded-3xl overflow-hidden border border-[#C9B086]/40 shadow-[0_25px_60px_-15px_rgba(201,176,134,0.25)] text-white">

        {/* Executive Modal Header */}
        <div className="relative px-6 py-5 bg-[#1A1D24] border-b border-[#C9B086]/25 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#C9B086] to-[#98A886] p-0.5 shadow-lg">
              <div className="w-full h-full bg-[#120B08] rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#E8DCB8]" />
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#98A886]">
                Wings River Café
              </span>
              <h3 className="font-serif font-bold text-base text-[#E8DCB8]">VIP Customer Portal</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-[#D4C4A0] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Fancy Step Indicator Bar */}
        <div className="px-6 py-3 bg-[#121417] border-b border-[#C9B086]/15 flex items-center justify-between text-[11px] font-semibold text-[#D4C4A0]">
          <div className={`flex items-center space-x-1.5 ${step === 'phone' ? 'text-[#E8DCB8] font-bold' : 'text-[#98A886]'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'phone' ? 'bg-[#C9B086] text-[#120B08]' : 'bg-[#98A886]/20 text-[#98A886]'}`}>1</span>
            <span>Phone</span>
          </div>
          <div className="w-8 h-0.5 bg-[#C9B086]/20" />
          <div className={`flex items-center space-x-1.5 ${step === 'otp' ? 'text-[#E8DCB8] font-bold' : step === 'profile' ? 'text-[#98A886]' : 'opacity-40'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'otp' ? 'bg-[#C9B086] text-[#120B08]' : 'bg-[#98A886]/20 text-[#98A886]'}`}>2</span>
            <span>OTP Code</span>
          </div>
          <div className="w-8 h-0.5 bg-[#C9B086]/20" />
          <div className={`flex items-center space-x-1.5 ${step === 'profile' ? 'text-[#E8DCB8] font-bold' : 'opacity-40'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'profile' ? 'bg-[#C9B086] text-[#120B08]' : 'bg-[#98A886]/20 text-[#98A886]'}`}>3</span>
            <span>Profile</span>
          </div>
        </div>

        {/* Form Body Container */}
        <div className="p-6 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-2">
              <X className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: Phone Number Input */}
          {step === 'phone' && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 rounded-2xl bg-[#C9B086]/15 border border-[#C9B086]/30 flex items-center justify-center mx-auto mb-2 text-[#C9B086]">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-serif font-bold text-[#E8DCB8]">Sign In with Mobile</h4>
                <p className="text-xs text-[#D4C4A0]/80 max-w-xs mx-auto">
                  Instant table reservations, priority water sports tickets & exclusive discounts.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#D4C4A0] mb-1.5">Enter Mobile Number</label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 flex items-center space-x-1.5 pointer-events-none">
                    <span className="text-base">🇮🇳</span>
                    <span className="text-xs font-bold text-[#98A886]">+91</span>
                  </div>
                  <input
                    type="tel"
                    required
                    autoFocus
                    maxLength={10}
                    value={phoneInput}
                    onChange={e => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="98765 43210"
                    className="w-full pl-20 pr-4 py-3.5 bg-[#181A1F] border border-[#C9B086]/35 rounded-2xl text-white text-base font-mono font-bold tracking-widest focus:outline-none focus:border-[#C9B086] focus:ring-2 focus:ring-[#C9B086]/25 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSendingOtp || phoneInput.length !== 10}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#C9B086] via-[#D8C49D] to-[#A3B58E] hover:from-[#E8DCB8] hover:to-[#B2C2A1] text-[#120B08] font-bold text-xs uppercase tracking-wider shadow-2xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01]"
              >
                {isSendingOtp ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: Fancy 6-Digit OTP Verification */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 rounded-2xl bg-[#98A886]/15 border border-[#98A886]/30 flex items-center justify-center mx-auto mb-2 text-[#98A886]">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-serif font-bold text-[#E8DCB8]">Verify 6-Digit OTP</h4>
                <p className="text-xs text-[#D4C4A0]/80">
                  Sent to <span className="text-[#E8DCB8] font-mono font-bold">+91 {phoneInput}</span>{' '}
                  <button
                    type="button"
                    onClick={() => setStep('phone')}
                    className="text-[#98A886] underline font-semibold ml-1 hover:text-[#E8DCB8]"
                  >
                    Edit Number
                  </button>
                </p>
              </div>

              {/* Demo Helper Banner with One-Click Auto-Fill */}
              {generatedOtp && (
                <div className="p-3 bg-[#1A1D24] border border-[#C9B086]/35 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-[#E8DCB8]">
                    <Sparkles className="w-4 h-4 text-[#C9B086] shrink-0" />
                    <span>Demo OTP Code: <strong className="font-mono text-base text-[#98A886] ml-1">{generatedOtp}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoFillDemoOtp}
                    className="px-2.5 py-1 bg-[#C9B086] text-[#120B08] font-bold text-[10px] rounded-lg uppercase tracking-wider hover:bg-[#E8DCB8] transition"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}

              {/* 6 Digit Inputs */}
              <div className="flex items-center justify-center gap-2">
                {otpInput.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={el => { otpRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(idx, e.target.value)}
                    onKeyDown={e => handleKeyDown(idx, e)}
                    className="w-11 h-14 text-center bg-[#181A1F] border border-[#C9B086]/35 rounded-2xl text-white font-bold text-xl font-mono focus:outline-none focus:border-[#C9B086] focus:ring-2 focus:ring-[#C9B086]/40 transition"
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-[#D4C4A0]">
                <span>Didn't receive code?</span>
                <button
                  type="button"
                  disabled={resendTimer > 0}
                  onClick={handleResendOtp}
                  className="font-bold text-[#98A886] hover:underline disabled:opacity-40"
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                </button>
              </div>

              <button
                type="submit"
                disabled={isVerifying || otpInput.join('').length !== 6}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#C9B086] via-[#D8C49D] to-[#A3B58E] hover:from-[#E8DCB8] hover:to-[#B2C2A1] text-[#120B08] font-bold text-xs uppercase tracking-wider shadow-2xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01]"
              >
                {isVerifying ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify &amp; Enter Portal</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 3: Fancy Executive Profile Registration */}
          {step === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 rounded-2xl bg-[#C9B086]/15 border border-[#C9B086]/30 flex items-center justify-center mx-auto mb-2 text-[#C9B086]">
                  <User className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-serif font-bold text-[#E8DCB8]">VIP Guest Profile</h4>
                <p className="text-xs text-[#D4C4A0]/80">Personalize your table bookings &amp; waterfront experiences.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#D4C4A0] mb-1.5">Full Name</label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 w-4 h-4 text-[#98A886]" />
                  <input
                    type="text"
                    required
                    autoFocus
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    placeholder="Rahul Sharma"
                    className="w-full pl-10 pr-4 py-3.5 bg-[#181A1F] border border-[#C9B086]/35 rounded-2xl text-white text-xs font-semibold focus:outline-none focus:border-[#C9B086]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#D4C4A0] mb-1.5">Email Address (Optional)</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 w-4 h-4 text-[#98A886]" />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={e => setEmailInput(e.target.value)}
                    placeholder="rahul@example.com"
                    className="w-full pl-10 pr-4 py-3.5 bg-[#181A1F] border border-[#C9B086]/35 rounded-2xl text-white text-xs font-semibold focus:outline-none focus:border-[#C9B086]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#C9B086] via-[#D8C49D] to-[#A3B58E] hover:from-[#E8DCB8] hover:to-[#B2C2A1] text-[#120B08] font-bold text-xs uppercase tracking-wider shadow-2xl transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>Save Profile &amp; Finish</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
