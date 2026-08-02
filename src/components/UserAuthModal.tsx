'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Phone, Lock, CheckCircle2, ShieldCheck, RefreshCw, User, LogOut, ArrowRight, Sparkles, KeyRound, Mail, Smartphone, UserCheck, UserPlus } from 'lucide-react';
import { triggerMsg91Otp } from '@/lib/otpVerification';

export interface UserSession {
  phone: string;
  name: string;
  email?: string;
  loggedIn: boolean;
  loggedInAt: string;
}

export interface RegisteredUser {
  phone: string;
  name: string;
  email?: string;
  registeredAt: string;
}

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: UserSession) => void;
}

// User Session Storage
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

// Database Registered Users Storage
export function getRegisteredUsers(): RegisteredUser[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('wings_registered_users');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveRegisteredUser(user: RegisteredUser) {
  if (typeof window === 'undefined') return;
  const users = getRegisteredUsers();
  const index = users.findIndex(u => u.phone.replace(/\D/g, '') === user.phone.replace(/\D/g, ''));
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem('wings_registered_users', JSON.stringify(users));
}

export function findRegisteredUser(phone: string): RegisteredUser | undefined {
  const clean = phone.replace(/\D/g, '');
  const localUser = getRegisteredUsers().find(u => u.phone.replace(/\D/g, '') === clean);
  if (localUser) return localUser;

  // Search in stored reservations and bookings history
  if (typeof window !== 'undefined') {
    try {
      const rawRes = localStorage.getItem('wings_reservations_db');
      if (rawRes) {
        const reservations: any[] = JSON.parse(rawRes);
        const match = reservations.find((r: any) => (r.phone || '').replace(/\D/g, '') === clean);
        if (match && match.name) {
          return {
            phone: clean,
            name: match.name,
            email: match.email || `${clean}@guest.wingsriver.com`,
            registeredAt: match.created_at || new Date().toISOString()
          };
        }
      }
    } catch (e) {}
  }
  return undefined;
}

export default function UserAuthModal({ isOpen, onClose, onSuccess }: UserAuthModalProps) {
  const [step, setStep] = useState<'phone' | 'otp' | 'profile'>('phone');
  const [phoneInput, setPhoneInput] = useState('');
  const [otpInput, setOtpInput] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [matchedUser, setMatchedUser] = useState<RegisteredUser | null>(null);
  
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

  // Phone input change handler with automatic database lookup
  const handlePhoneInputChange = (val: string) => {
    const clean = val.replace(/\D/g, '');
    setPhoneInput(clean);
    if (clean.length === 10) {
      const existing = findRegisteredUser(clean);
      setMatchedUser(existing || null);
    } else {
      setMatchedUser(null);
    }
  };

  // Handle Send Real MSG91 SMS OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneInput.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    setErrorMsg('');
    setIsSendingOtp(true);

    const existing = findRegisteredUser(cleanPhone);
    setMatchedUser(existing || null);

    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone })
      });
      const data = await res.json().catch(() => ({}));
      setIsSendingOtp(false);

      if (res.ok && data.success) {
        setStep('otp');
        setResendTimer(30);
        setTimeout(() => otpRefs.current[0]?.focus(), 150);
      } else {
        setErrorMsg(data.error || 'Failed to send OTP. Please check your mobile number.');
      }
    } catch (err: any) {
      setIsSendingOtp(false);
      setErrorMsg(err.message || 'SMS Gateway Connection Error.');
    }
  };

  // Trigger Official MSG91 / Phone91 OTP Service Widget
  const handleMsg91Otp = () => {
    const cleanPhone = phoneInput.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number');
      return;
    }
    setErrorMsg('');
    setIsSendingOtp(true);

    const existing = findRegisteredUser(cleanPhone);
    setMatchedUser(existing || null);

    triggerMsg91Otp({
      identifier: cleanPhone,
      onSuccess: (data) => {
        setIsSendingOtp(false);
        if (existing) {
          const session: UserSession = {
            phone: cleanPhone,
            name: existing.name,
            email: existing.email,
            loggedIn: true,
            loggedInAt: new Date().toISOString(),
          };
          saveUserSession(session);
          if (onSuccess) onSuccess(session);
          onClose();
        } else {
          setStep('profile');
        }
      },
      onFailure: (err) => {
        setIsSendingOtp(false);
        setErrorMsg(typeof err === 'string' ? err : 'OTP Verification failed or cancelled');
      },
    });
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

  // Handle Verify Real MSG91 SMS OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = otpInput.join('');
    if (enteredCode.length !== 6) {
      setErrorMsg('Please enter the 6-digit OTP code received via SMS');
      return;
    }

    setErrorMsg('');
    setIsVerifying(true);

    const cleanPhone = phoneInput.replace(/\D/g, '');

    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, otp: enteredCode })
      });
      const data = await res.json().catch(() => ({}));
      setIsVerifying(false);

      if (res.ok && data.success) {
        const userFound = matchedUser || findRegisteredUser(cleanPhone);
        if (userFound) {
          const session: UserSession = {
            phone: cleanPhone,
            name: userFound.name || 'Valued Guest',
            email: userFound.email || `${cleanPhone}@guest.wingsriver.com`,
            loggedIn: true,
            loggedInAt: new Date().toISOString(),
          };
          saveUserSession(session);
          saveRegisteredUser(userFound);
          if (onSuccess) onSuccess(session);
          onClose();
        } else {
          setStep('profile');
        }
      } else {
        setErrorMsg(data.error || 'Invalid or expired OTP SMS code.');
      }
    } catch (err: any) {
      setIsVerifying(false);
      setErrorMsg(err.message || 'OTP verification connection error.');
    }
  };

  // Handle Sign Up Profile Submission
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = nameInput.trim() || `Customer ${phoneInput.slice(-4)}`;
    const cleanPhone = phoneInput.replace(/\D/g, '');
    
    // Save to Registered Users Database
    const regUser: RegisteredUser = {
      phone: cleanPhone,
      name,
      email: emailInput.trim(),
      registeredAt: new Date().toISOString(),
    };
    saveRegisteredUser(regUser);

    const session: UserSession = {
      phone: cleanPhone,
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
      <div className="absolute w-96 h-96 bg-[#F5D061]/15 rounded-full blur-3xl pointer-events-none -top-20 -left-20" />
      <div className="absolute w-96 h-96 bg-[#98A886]/15 rounded-full blur-3xl pointer-events-none -bottom-20 -right-20" />

      <div className="relative w-full max-w-md bg-[#14171D] rounded-3xl overflow-hidden border border-[#F5D061]/40 shadow-[0_25px_60px_-15px_rgba(245,208,97,0.25)] text-white">

        {/* Executive Modal Header */}
        <div className="relative px-6 py-5 bg-[#1A1D24] border-b border-[#F5D061]/25 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F5D061] to-[#E5B82C] p-0.5 shadow-lg">
              <div className="w-full h-full bg-[#120B08] rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#F5D061]" />
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#98A886]">
                Wings River Café
              </span>
              <h3 className="font-serif font-bold text-base text-[#F8E7A1]">Customer Authentication</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-[#D4C4A0] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Bar */}
        <div className="px-6 py-3 bg-[#121417] border-b border-[#F5D061]/15 flex items-center justify-between text-[11px] font-semibold text-[#D4C4A0]">
          <div className={`flex items-center space-x-1.5 ${step === 'phone' ? 'text-[#F5D061] font-bold' : 'text-[#98A886]'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'phone' ? 'bg-[#F5D061] text-[#120B08] font-bold' : 'bg-[#98A886]/20 text-[#98A886]'}`}>1</span>
            <span>Mobile</span>
          </div>
          <div className="w-8 h-0.5 bg-[#F5D061]/20" />
          <div className={`flex items-center space-x-1.5 ${step === 'otp' ? 'text-[#F5D061] font-bold' : step === 'profile' ? 'text-[#98A886]' : 'opacity-40'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'otp' ? 'bg-[#F5D061] text-[#120B08] font-bold' : 'bg-[#98A886]/20 text-[#98A886]'}`}>2</span>
            <span>OTP Code</span>
          </div>
          <div className="w-8 h-0.5 bg-[#F5D061]/20" />
          <div className={`flex items-center space-x-1.5 ${step === 'profile' ? 'text-[#F5D061] font-bold' : 'opacity-40'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'profile' ? 'bg-[#F5D061] text-[#120B08] font-bold' : 'bg-[#98A886]/20 text-[#98A886]'}`}>3</span>
            <span>Sign Up</span>
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
                <div className="w-12 h-12 rounded-2xl bg-[#F5D061]/15 border border-[#F5D061]/30 flex items-center justify-center mx-auto mb-2 text-[#F5D061]">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-serif font-bold text-[#F8E7A1]">Login / Sign Up</h4>
                <p className="text-xs text-[#D4C4A0]/80 max-w-xs mx-auto">
                  Enter your 10-digit mobile number. Registered users are automatically logged in via OTP!
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#D4C4A0] mb-1.5">Mobile Number</label>
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
                    onChange={e => handlePhoneInputChange(e.target.value)}
                    placeholder="98765 43210"
                    className="w-full pl-20 pr-4 py-3.5 bg-[#181A1F] border border-[#F5D061]/35 rounded-2xl text-white text-base font-mono font-bold tracking-widest focus:outline-none focus:border-[#F5D061] focus:ring-2 focus:ring-[#F5D061]/25 transition"
                  />
                </div>

                {/* Instant Database Lookup Badge Indicator */}
                {phoneInput.length === 10 && (
                  <div className="mt-2 text-center">
                    {matchedUser ? (
                      <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-3 py-1 rounded-full inline-flex items-center space-x-1">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Registered Account Found ({matchedUser.name}) • Instant Login Mode</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-[#F5D061] bg-[#1F1810] border border-[#F5D061]/40 px-3 py-1 rounded-full inline-flex items-center space-x-1">
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>New Mobile Number • Sign Up Account Creation</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSendingOtp || phoneInput.length !== 10}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#F5D061] via-[#E5B82C] to-[#D4AF37] hover:from-[#F8E7A1] hover:to-[#F5D061] text-[#120B08] font-bold text-xs uppercase tracking-wider shadow-2xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01]"
              >
                {isSendingOtp ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Send SMS OTP Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>
          )}

          {/* STEP 2: 6-Digit OTP Verification */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 rounded-2xl bg-[#98A886]/15 border border-[#98A886]/30 flex items-center justify-center mx-auto mb-2 text-[#98A886]">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-serif font-bold text-[#F8E7A1]">Enter 6-Digit OTP</h4>
                
                {matchedUser ? (
                  <div className="px-3 py-1 bg-emerald-950/70 border border-emerald-500/40 rounded-full inline-flex items-center space-x-1.5 text-xs text-emerald-300 font-bold my-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Welcome Back, <strong>{matchedUser.name}</strong>! (Direct Login)</span>
                  </div>
                ) : (
                  <div className="px-3 py-1 bg-[#1F1810] border border-[#F5D061]/40 rounded-full inline-flex items-center space-x-1.5 text-xs text-[#F5D061] font-bold my-1">
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>New Customer Account Setup</span>
                  </div>
                )}

                <p className="text-xs text-[#D4C4A0]/80">
                  Sent to <span className="text-[#F8E7A1] font-mono font-bold">+91 {phoneInput}</span>{' '}
                  <button
                    type="button"
                    onClick={() => setStep('phone')}
                    className="text-[#98A886] underline font-semibold ml-1 hover:text-[#F8E7A1]"
                  >
                    Edit
                  </button>
                </p>
              </div>



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
                    className="w-11 h-14 text-center bg-[#181A1F] border border-[#F5D061]/35 rounded-2xl text-white font-bold text-xl font-mono focus:outline-none focus:border-[#F5D061] focus:ring-2 focus:ring-[#F5D061]/40 transition"
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
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#F5D061] via-[#E5B82C] to-[#D4AF37] hover:from-[#F8E7A1] hover:to-[#F5D061] text-[#120B08] font-bold text-xs uppercase tracking-wider shadow-2xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01]"
              >
                {isVerifying ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{matchedUser ? 'Direct Login to Account' : 'Verify & Continue Sign Up'}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 3: Sign Up Profile Details (Only shown when phone number is NOT in DB) */}
          {step === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 rounded-2xl bg-[#F5D061]/15 border border-[#F5D061]/30 flex items-center justify-center mx-auto mb-2 text-[#F5D061]">
                  <UserPlus className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-serif font-bold text-[#F8E7A1]">Complete Account Sign Up</h4>
                <p className="text-xs text-[#D4C4A0]/80">Please enter your full name to complete your account setup.</p>
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
                    className="w-full pl-10 pr-4 py-3.5 bg-[#181A1F] border border-[#F5D061]/35 rounded-2xl text-white text-xs font-semibold focus:outline-none focus:border-[#F5D061]"
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
                    className="w-full pl-10 pr-4 py-3.5 bg-[#181A1F] border border-[#F5D061]/35 rounded-2xl text-white text-xs font-semibold focus:outline-none focus:border-[#F5D061]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#F5D061] via-[#E5B82C] to-[#D4AF37] hover:from-[#F8E7A1] hover:to-[#F5D061] text-[#120B08] font-bold text-xs uppercase tracking-wider shadow-2xl transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>Create Account &amp; Login</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
