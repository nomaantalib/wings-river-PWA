'use client';

import { useAuth } from '@/context/AuthContext';
import { triggerMsg91Otp } from '@/lib/otpVerification';
import { ArrowRight, CheckCircle2, KeyRound, Mail, RefreshCw, ShieldCheck, Smartphone, User, UserCheck, UserPlus, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

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

// Dedicated Customer User Session Storage
export function getStoredUserSession(): UserSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('wings_customer_session') || localStorage.getItem('wings_user_session');
    if (!raw) return null;
    const parsed = JSON.parse(raw);

    // Reject staff/admin/waiter/manager role sessions from customer profile
    if (parsed && parsed.role && ['Waiter', 'Manager', 'Admin', 'Administrator', 'Kitchen', 'Billing', 'Staff'].includes(parsed.role)) {
      return null;
    }
    if (parsed && parsed.loggedIn === false) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveUserSession(session: UserSession) {
  if (typeof window === 'undefined') return;
  const customerSession = { ...session, role: 'Customer' };
  localStorage.setItem('wings_customer_session', JSON.stringify(customerSession));
  localStorage.setItem('wings_user_session', JSON.stringify(customerSession));
  window.dispatchEvent(new Event('wings_customer_auth_change'));
  window.dispatchEvent(new Event('wings_auth_change'));
}

export function clearUserSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('wings_customer_session');
  localStorage.removeItem('wings_user_session');
  window.dispatchEvent(new Event('wings_customer_auth_change'));
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
  const { sendOtp, loginCustomerOtp, loginCustomerWidgetToken } = useAuth();
  const [step, setStep] = useState<'phone' | 'otp' | 'profile'>('phone');
  const [phoneInput, setPhoneInput] = useState('');
  const [otpInput, setOtpInput] = useState(['', '', '', '']);
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [matchedUser, setMatchedUser] = useState<RegisteredUser | null>(null);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const verifyingRef = useRef(false);

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
    const digits = val.replace(/\D/g, '').slice(0, 10);
    setPhoneInput(digits);
    if (digits.length === 10) {
      const match = findRegisteredUser(digits);
      setMatchedUser(match || null);
    } else {
      setMatchedUser(null);
    }
  };

  // Dispatch SMS OTP Code
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneInput.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number');
      return;
    }
    if (!emailInput.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.trim())) {
      setErrorMsg('Please enter a valid email address to receive your OTP');
      return;
    }

    setErrorMsg('');
    setIsSendingOtp(true);

    try {
      const res = await sendOtp(cleanPhone, emailInput.trim());
      setIsSendingOtp(false);

      if (res.success) {
        setOtpInput(['', '', '', '']);
        setStep('otp');
        setResendTimer(30);
        verifyingRef.current = false;
        setTimeout(() => otpRefs.current[0]?.focus(), 150);
      } else {
        setErrorMsg(res.error || 'Failed to send OTP. Please check your mobile number.');
      }
    } catch (err: any) {
      setIsSendingOtp(false);
      setErrorMsg(err.message || 'SMS Gateway Connection Error.');
    }
  };

  // Handle OTP digit changes with auto-submit on 6th digit
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpInput];
    newOtp[index] = value.slice(-1);
    setOtpInput(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 4) {
      setTimeout(() => {
        submitOtpCode(newOtp.join(''));
      }, 50);
    }
  };

  // Handle OTP backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpInput[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Core verification worker — thread-safe lock prevents duplicate simultaneous API calls
  const submitOtpCode = async (codeToVerify: string) => {
    if (codeToVerify.length !== 6 || isVerifying || verifyingRef.current) return;
    verifyingRef.current = true;
    setErrorMsg('');
    setIsVerifying(true);

    const cleanPhone = phoneInput.replace(/\D/g, '');

    try {
      const userFound = matchedUser || findRegisteredUser(cleanPhone);
      const res = await loginCustomerOtp(cleanPhone, codeToVerify, userFound?.name, userFound?.email);
      setIsVerifying(false);
      verifyingRef.current = false;

      if (res.success) {
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
        setErrorMsg(res.error || 'Invalid or expired OTP SMS code.');
      }
    } catch (err: any) {
      setIsVerifying(false);
      verifyingRef.current = false;
      setErrorMsg(err.message || 'OTP verification connection error.');
    }
  };

  // Handle Verify Real SMS OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = otpInput.join('');
    if (enteredCode.length !== 4) {
      setErrorMsg('Please enter the 4-digit OTP code received via SMS');
      return;
    }
    submitOtpCode(enteredCode);
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
    setOtpInput(['', '', '', '']);
    setErrorMsg('');
    otpRefs.current[0]?.focus();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      {/* Ambient Background Glows */}
      <div className="absolute w-96 h-96 bg-[#F5D061]/20 rounded-full blur-3xl pointer-events-none -top-20 -left-20" />
      <div className="absolute w-96 h-96 bg-[#D97706]/10 rounded-full blur-3xl pointer-events-none -bottom-20 -right-20" />

      <div className="relative w-full max-w-md bg-[#FAF7F2] rounded-3xl overflow-hidden border border-[#D97706]/30 shadow-2xl text-[#1F1810] my-auto">

        {/* Executive Modal Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-[#1F1810] via-[#2D2319] to-[#1F1810] border-b border-[#D97706]/30 flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F5D061] via-[#D97706] to-[#B45309] p-0.5 shadow-lg">
              <div className="w-full h-full bg-[#1F1810] rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#F5D061]" />
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#F5D061]">
                Wings River Café
              </span>
              <h3 className="font-serif font-bold text-base text-[#F8E7A1]">Customer Authentication</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#F5D061] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Bar — Navbar Header Green Theme (#345E28 = mint-800) */}
        <div className="px-6 py-3.5 bg-[#345E28] border-b border-[#1B4318]/40 flex items-center justify-between text-xs font-extrabold text-white">
          <div className={`flex items-center space-x-2 ${step === 'phone' ? 'text-white font-black scale-105' : 'text-white/65'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shadow-sm ${step === 'phone' ? 'bg-[#FFD700] text-[#1B4318]' : 'bg-white/20 text-white'}`}>1</span>
            <span className="tracking-wide">Mobile</span>
          </div>
          <div className="w-8 h-0.5 bg-white/30" />
          <div className={`flex items-center space-x-2 ${step === 'otp' ? 'text-white font-black scale-105' : step === 'profile' ? 'text-white/75' : 'text-white/50'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shadow-sm ${step === 'otp' ? 'bg-[#FFD700] text-[#1B4318]' : 'bg-white/20 text-white'}`}>2</span>
            <span className="tracking-wide">OTP Code</span>
          </div>
          <div className="w-8 h-0.5 bg-white/30" />
          <div className={`flex items-center space-x-2 ${step === 'profile' ? 'text-white font-black scale-105' : 'text-white/50'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shadow-sm ${step === 'profile' ? 'bg-[#FFD700] text-[#1B4318]' : 'bg-white/20 text-white'}`}>3</span>
            <span className="tracking-wide">Sign Up</span>
          </div>
        </div>

        {/* Form Body Container */}
        <div className="p-6 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-100 border border-red-300 text-red-700 text-xs font-semibold flex items-center gap-2">
              <X className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: Phone Number Input */}
          {step === 'phone' && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 rounded-2xl bg-[#FFD700] border-2 border-[#FFA000] flex items-center justify-center mx-auto mb-2 text-[#111111] shadow-md shadow-amber-400/30">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-serif font-bold text-[#78350F]">Login / Sign Up</h4>
                <p className="text-xs text-[#92400E] max-w-xs mx-auto font-medium">
                  Enter your mobile number &amp; email — we&apos;ll send your OTP to your inbox instantly!
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#B45309] uppercase tracking-wider mb-1.5">Mobile Number</label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 flex items-center space-x-1.5 pointer-events-none">
                    <span className="text-base">🇮🇳</span>
                    <span className="text-xs font-extrabold text-[#B8860B]">+91</span>
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phoneInput}
                    onChange={e => handlePhoneInputChange(e.target.value)}
                    placeholder="98765 43210"
                    className="w-full pl-20 pr-4 py-3.5 bg-white border-2 border-[#FFD700] rounded-2xl text-[#1F1810] text-base font-mono font-bold tracking-widest focus:outline-none focus:border-[#FFA000] focus:ring-4 focus:ring-[#FFD700]/30 shadow-sm transition"
                  />
                </div>

                {/* Instant Database Lookup Badge Indicator */}
                {phoneInput.length === 10 && (
                  <div className="mt-2 text-center">
                    {matchedUser ? (
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full inline-flex items-center space-x-1 shadow-sm">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Registered Account Found ({matchedUser.name}) • Instant Login Mode</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-[#78350F] bg-[#FEF3C7] border border-[#FFD700] px-3 py-1 rounded-full inline-flex items-center space-x-1 shadow-sm">
                        <UserPlus className="w-3.5 h-3.5 text-[#B8860B]" />
                        <span>New Mobile Number • Sign Up Account Creation</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-xs font-bold text-[#B45309] uppercase tracking-wider mb-1.5">Email Address <span className="text-red-500">*</span></label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 pointer-events-none">
                    <span className="text-sm">✉️</span>
                  </div>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={e => setEmailInput(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3.5 bg-white border-2 border-[#FFD700] rounded-2xl text-[#1F1810] text-sm font-medium focus:outline-none focus:border-[#FFA000] focus:ring-4 focus:ring-[#FFD700]/30 shadow-sm transition"
                  />
                </div>
                <p className="mt-1 text-[10px] text-[#92400E] font-medium">📩 OTP will be sent to this email address</p>
              </div>

              <button
                type="submit"
                disabled={isSendingOtp || phoneInput.length !== 10 || !emailInput.includes('@')}
                className="w-full py-4 rounded-2xl bg-[#FFD700] hover:bg-[#FFC107] active:bg-[#FFA000] text-[#111111] font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-400/30 border border-[#FFA000]/40 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01]"
              >
                {isSendingOtp ? (
                  <RefreshCw className="w-5 h-5 animate-spin text-[#111111]" />
                ) : (
                  <>
                    <span>Send OTP to Email</span>
                    <ArrowRight className="w-4 h-4 text-[#111111]" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: 6-Digit OTP Verification */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 rounded-2xl bg-[#FFD700] border-2 border-[#FFA000] flex items-center justify-center mx-auto mb-2 text-[#111111] shadow-md shadow-amber-400/30">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-serif font-bold text-[#78350F]">Enter 4-Digit OTP</h4>
                
                {matchedUser ? (
                  <div className="px-3 py-1 bg-emerald-100 border border-emerald-300 rounded-full inline-flex items-center space-x-1.5 text-xs text-emerald-800 font-bold my-1 shadow-sm">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Welcome Back, <strong>{matchedUser.name}</strong>! (Direct Login)</span>
                  </div>
                ) : (
                  <div className="px-3 py-1 bg-[#FEF3C7] border border-[#FFD700] rounded-full inline-flex items-center space-x-1.5 text-xs text-[#78350F] font-bold my-1 shadow-sm">
                    <UserPlus className="w-3.5 h-3.5 text-[#B8860B]" />
                    <span>New Customer Account Setup</span>
                  </div>
                )}

                <p className="text-xs text-[#92400E] font-medium">
                  OTP sent to <span className="text-[#B45309] font-mono font-bold">{emailInput.replace(/(.{2}).*(@.*)/, '$1***$2')}</span> &amp; <span className="text-[#B45309] font-mono font-bold">+91 {phoneInput.slice(0,2)}****{phoneInput.slice(-4)}</span>{' '}
                  <button
                    type="button"
                    onClick={() => setStep('phone')}
                    className="text-[#B8860B] underline font-bold ml-1 hover:text-[#78350F]"
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
                    className="w-11 h-14 text-center bg-white border-2 border-[#FFD700] rounded-2xl text-[#1F1810] font-bold text-xl font-mono focus:outline-none focus:border-[#FFA000] focus:ring-4 focus:ring-[#FFD700]/30 shadow-sm transition"
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-[#92400E]">
                <span>Didn&apos;t receive code?</span>
                <button
                  type="button"
                  disabled={resendTimer > 0}
                  onClick={handleResendOtp}
                  className="font-bold text-[#B8860B] hover:underline disabled:opacity-40"
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                </button>
              </div>

              <button
                type="submit"
                disabled={isVerifying || otpInput.join('').length !== 4}
                className="w-full py-4 rounded-2xl bg-[#FFD700] hover:bg-[#FFC107] active:bg-[#FFA000] text-[#111111] font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-400/30 border border-[#FFA000]/40 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01]"
              >
                {isVerifying ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-[#111111]" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#111111]" />
                    <span>{matchedUser ? 'Direct Login to Account' : 'Verify & Continue Sign Up'}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 3: Sign Up Profile Details */}
          {step === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 rounded-2xl bg-[#FFD700] border-2 border-[#FFA000] flex items-center justify-center mx-auto mb-2 text-[#111111] shadow-md shadow-amber-400/30">
                  <UserPlus className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-serif font-bold text-[#78350F]">Complete Account Sign Up</h4>
                <p className="text-xs text-[#92400E] font-medium">Please enter your full name to complete your account setup.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#B45309] uppercase tracking-wider mb-1.5">Full Name</label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 w-4 h-4 text-[#B8860B]" />
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    placeholder="Rahul Sharma"
                    className="w-full pl-10 pr-4 py-3.5 bg-white border-2 border-[#FFD700] rounded-2xl text-[#1F1810] text-xs font-semibold focus:outline-none focus:border-[#FFA000] shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#B45309] uppercase tracking-wider mb-1.5">Email Address (Optional)</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 w-4 h-4 text-[#B8860B]" />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={e => setEmailInput(e.target.value)}
                    placeholder="rahul@example.com"
                    className="w-full pl-10 pr-4 py-3.5 bg-white border-2 border-[#FFD700] rounded-2xl text-[#1F1810] text-xs font-semibold focus:outline-none focus:border-[#FFA000] shadow-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-[#FFD700] hover:bg-[#FFC107] active:bg-[#FFA000] text-[#111111] font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-400/30 border border-[#FFA000]/40 transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-[1.01]"
              >
                <span>Save Profile &amp; Login</span>
                <ArrowRight className="w-4 h-4 text-[#111111]" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
