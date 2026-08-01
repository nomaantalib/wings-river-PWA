'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Phone, Lock, CheckCircle2, ShieldCheck, RefreshCw, User, LogOut, ArrowRight } from 'lucide-react';

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
  const [successMsg, setSuccessMsg] = useState('');
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
      // Generate a 6-digit OTP (for test environment, default to 123456 or random)
      const code = String(Math.floor(100000 + Math.random() * 900000));
      setGeneratedOtp(code);
      setIsSendingOtp(false);
      setStep('otp');
      setResendTimer(30);
      setSuccessMsg(`OTP sent to +91 ${cleanPhone}. Test Code: ${code}`);

      // Auto-fill first box
      setTimeout(() => otpRefs.current[0]?.focus(), 150);
    }, 600);
  };

  // Handle OTP digit changes
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpInput];
    newOtp[index] = value.slice(-1);
    setOtpInput(newOtp);

    // Auto-focus next box
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
      setErrorMsg('Please enter the 6-digit OTP sent to your phone');
      return;
    }

    if (enteredCode !== generatedOtp && enteredCode !== '123456') {
      setErrorMsg(`Invalid OTP code. Use test OTP: ${generatedOtp || '123456'}`);
      return;
    }

    setErrorMsg('');
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      // Move to profile setup or complete login
      const existingSession = getStoredUserSession();
      if (existingSession?.name) {
        // Complete login
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
    }, 500);
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
    setSuccessMsg(`New OTP sent to +91 ${phoneInput}. Test Code: ${code}`);
    otpRefs.current[0]?.focus();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#0B0C0E]/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-[#14171D] rounded-3xl overflow-hidden border border-[#C9B086]/40 shadow-2xl text-white">

        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#1A1D24] border-b border-[#C9B086]/20">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-[#98A886]" />
            <h3 className="font-serif font-bold text-base text-[#E8DCB8]">User Authentication</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-[#98A886]/15 border border-[#98A886]/30 text-[#D8E2CD] text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#98A886] shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* STEP 1: Phone Number Entry */}
          {step === 'phone' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="text-center space-y-1">
                <h4 className="text-lg font-serif font-bold text-[#E8DCB8]">Enter Your Mobile Number</h4>
                <p className="text-xs text-[#D4C4A0]/80">We will send a 6-digit OTP code to verify your phone number.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#D4C4A0] mb-1">Mobile Number</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs font-bold text-[#98A886]">+91</span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phoneInput}
                    onChange={e => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full pl-13 pr-4 py-3 bg-[#181A1F] border border-[#C9B086]/30 rounded-2xl text-white text-sm font-mono tracking-widest focus:outline-none focus:border-[#C9B086]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSendingOtp || phoneInput.length !== 10}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#C9B086] to-[#A3B58E] hover:from-[#E8DCB8] hover:to-[#B2C2A1] text-[#120B08] font-bold text-xs uppercase tracking-wider shadow-xl transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isSendingOtp ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Send Verification OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: OTP Verification */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="text-center space-y-1">
                <h4 className="text-lg font-serif font-bold text-[#E8DCB8]">Enter 6-Digit OTP</h4>
                <p className="text-xs text-[#D4C4A0]/80">
                  Sent to <span className="text-[#E8DCB8] font-mono font-bold">+91 {phoneInput}</span>{' '}
                  <button
                    type="button"
                    onClick={() => setStep('phone')}
                    className="text-[#98A886] underline font-semibold ml-1"
                  >
                    Change
                  </button>
                </p>
              </div>

              {/* 6 Digit Inputs */}
              <div className="flex items-center justify-between gap-2">
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
                    className="w-11 h-13 text-center bg-[#181A1F] border border-[#C9B086]/30 rounded-2xl text-white font-bold text-lg font-mono focus:outline-none focus:border-[#C9B086] focus:ring-2 focus:ring-[#C9B086]/30"
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
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#C9B086] to-[#A3B58E] hover:from-[#E8DCB8] hover:to-[#B2C2A1] text-[#120B08] font-bold text-xs uppercase tracking-wider shadow-xl transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isVerifying ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify &amp; Continue</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 3: Optional Profile Info */}
          {step === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="text-center space-y-1">
                <h4 className="text-lg font-serif font-bold text-[#E8DCB8]">Complete Your Profile</h4>
                <p className="text-xs text-[#D4C4A0]/80">Enter your name for fast table reservations and special offers.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#D4C4A0] mb-1">Your Full Name</label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 w-4 h-4 text-[#98A886]" />
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    placeholder="Rahul Sharma"
                    className="w-full pl-10 pr-4 py-3 bg-[#181A1F] border border-[#C9B086]/30 rounded-2xl text-white text-xs font-semibold focus:outline-none focus:border-[#C9B086]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#D4C4A0] mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  placeholder="rahul@example.com"
                  className="w-full px-4 py-3 bg-[#181A1F] border border-[#C9B086]/30 rounded-2xl text-white text-xs font-semibold focus:outline-none focus:border-[#C9B086]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#C9B086] to-[#A3B58E] hover:from-[#E8DCB8] hover:to-[#B2C2A1] text-[#120B08] font-bold text-xs uppercase tracking-wider shadow-xl transition flex items-center justify-center space-x-2"
              >
                <span>Save &amp; Finish</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
