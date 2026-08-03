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
      const res = await sendOtp(cleanPhone);
      setIsSendingOtp(false);

      if (res.success) {
        if (res.dev_otp) {
          console.log(`[MSG91 OTP Sent] Verification Code for +91${cleanPhone}: ${res.dev_otp}`);
        }
        setOtpInput(['', '', '', '', '', '']);
        setStep('otp');
        setResendTimer(30);
        setTimeout(() => otpRefs.current[0]?.focus(), 150);
      } else {
        setErrorMsg(res.error || 'Failed to send OTP. Please check your mobile number.');
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
      onSuccess: async (data) => {
        setIsSendingOtp(false);
        const token = data?.token || data?.access_token || data;
        if (!token) {
          setErrorMsg('No verification token returned from MSG91 widget.');
          return;
        }

        setIsVerifying(true);
        try {
          const authRes = await loginCustomerWidgetToken(token, cleanPhone, nameInput, emailInput);
          setIsVerifying(false);

          if (authRes.success) {
            const session: UserSession = {
              phone: cleanPhone,
              name: existing?.name || nameInput || 'Guest Customer',
              email: existing?.email || emailInput || '',
              loggedIn: true,
              loggedInAt: new Date().toISOString(),
            };
            saveUserSession(session);
            if (onSuccess) onSuccess(session);
            onClose();
          } else {
            setErrorMsg(authRes.error || 'Server session generation failed after OTP verification.');
          }
        } catch (err: any) {
          setIsVerifying(false);
          setErrorMsg(err.message || 'Server connection error during session generation.');
        }
      },
      onFailure: (err) => {
        setIsSendingOtp(false);
        setErrorMsg(typeof err === 'string' ? err : 'OTP Verification failed or cancelled');
      },
    });
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

    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
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

  // Core verification worker
  const submitOtpCode = async (codeToVerify: string) => {
    if (codeToVerify.length !== 6 || isVerifying) return;
    setErrorMsg('');
    setIsVerifying(true);

    const cleanPhone = phoneInput.replace(/\D/g, '');

    try {
      const userFound = matchedUser || findRegisteredUser(cleanPhone);
      const res = await loginCustomerOtp(cleanPhone, codeToVerify, userFound?.name, userFound?.email);
      setIsVerifying(false);

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
      setErrorMsg(err.message || 'OTP verification connection error.');
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
    setOtpInput(['', '', '', '', '', '']);
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

        {/* Step Indicator Bar — Pista Green Theme */}
        <div className="px-6 py-3.5 bg-[#D8EED8] border-b border-[#558B2F]/25 flex items-center justify-between text-xs font-bold text-[#1B5E20]">
          <div className={`flex items-center space-x-2 ${step === 'phone' ? 'text-[#1B5E20] font-black' : 'text-[#388E3C]/80'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shadow-sm ${step === 'phone' ? 'bg-[#558B2F] text-white' : 'bg-[#C8E6C9] text-[#2E7D32]'}`}>1</span>
            <span>Mobile</span>
          </div>
          <div className="w-8 h-0.5 bg-[#558B2F]/30" />
          <div className={`flex items-center space-x-2 ${step === 'otp' ? 'text-[#1B5E20] font-black' : step === 'profile' ? 'text-[#388E3C]/80' : 'opacity-60'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shadow-sm ${step === 'otp' ? 'bg-[#558B2F] text-white' : 'bg-[#C8E6C9] text-[#2E7D32]'}`}>2</span>
            <span>OTP Code</span>
          </div>
          <div className="w-8 h-0.5 bg-[#558B2F]/30" />
          <div className={`flex items-center space-x-2 ${step === 'profile' ? 'text-[#1B5E20] font-black' : 'opacity-60'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shadow-sm ${step === 'profile' ? 'bg-[#558B2F] text-white' : 'bg-[#C8E6C9] text-[#2E7D32]'}`}>3</span>
            <span>Sign Up</span>
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
                <div className="w-12 h-12 rounded-2xl bg-[#FFD700]/20 border border-[#FFD700] flex items-center justify-center mx-auto mb-2 text-[#B8860B] shadow-sm">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-serif font-bold text-[#78350F]">Login / Sign Up</h4>
                <p className="text-xs text-[#92400E] max-w-xs mx-auto font-medium">
                  Enter your 10-digit mobile number. Registered users are automatically logged in via OTP!
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
                    className="w-full pl-20 pr-4 py-3.5 bg-white border-2 border-[#FFD700] rounded-2xl text-[#1F1810] text-base font-mono font-bold tracking-widest focus:outline-none focus:border-[#E6B800] focus:ring-4 focus:ring-[#FFD700]/30 shadow-sm transition"
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

              <button
                type="submit"
                disabled={isSendingOtp || phoneInput.length !== 10}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FFD700] via-[#F5C400] to-[#E6B800] hover:from-[#FFE033] hover:to-[#FFD700] text-[#1A1200] font-black text-xs uppercase tracking-wider shadow-xl shadow-amber-500/25 border border-[#FFD700]/50 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01]"
              >
                {isSendingOtp ? (
                  <RefreshCw className="w-5 h-5 animate-spin text-[#1A1200]" />
                ) : (
                  <>
                    <span>Send SMS OTP Code</span>
                    <ArrowRight className="w-4 h-4 text-[#1A1200]" />
                  </>
                )}
              </button>

            </form>
          )}

          {/* STEP 2: 6-Digit OTP Verification */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 rounded-2xl bg-[#FFD700]/20 border border-[#FFD700] flex items-center justify-center mx-auto mb-2 text-[#B8860B] shadow-sm">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-serif font-bold text-[#78350F]">Enter 6-Digit OTP</h4>
                
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
                  Sent to <span className="text-[#B45309] font-mono font-bold">+91 {phoneInput}</span>{' '}
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
                    className="w-11 h-14 text-center bg-white border-2 border-[#FFD700] rounded-2xl text-[#1F1810] font-bold text-xl font-mono focus:outline-none focus:border-[#E6B800] focus:ring-4 focus:ring-[#FFD700]/30 shadow-sm transition"
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
                disabled={isVerifying || otpInput.join('').length !== 6}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FFD700] via-[#F5C400] to-[#E6B800] hover:from-[#FFE033] hover:to-[#FFD700] text-[#1A1200] font-black text-xs uppercase tracking-wider shadow-xl shadow-amber-500/25 border border-[#FFD700]/50 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01]"
              >
                {isVerifying ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-[#1A1200]" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#1A1200]" />
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
                <div className="w-12 h-12 rounded-2xl bg-[#FFD700]/20 border border-[#FFD700] flex items-center justify-center mx-auto mb-2 text-[#B8860B] shadow-sm">
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
                    className="w-full pl-10 pr-4 py-3.5 bg-white border-2 border-[#FFD700] rounded-2xl text-[#1F1810] text-xs font-semibold focus:outline-none focus:border-[#E6B800] shadow-sm"
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
                    className="w-full pl-10 pr-4 py-3.5 bg-white border-2 border-[#FFD700] rounded-2xl text-[#1F1810] text-xs font-semibold focus:outline-none focus:border-[#E6B800] shadow-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FFD700] via-[#F5C400] to-[#E6B800] hover:from-[#FFE033] hover:to-[#FFD700] text-[#1A1200] font-black text-xs uppercase tracking-wider shadow-xl shadow-amber-500/25 border border-[#FFD700]/50 transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-[1.01]"
              >
                <span>Save Profile &amp; Login</span>
                <ArrowRight className="w-4 h-4 text-[#1A1200]" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
