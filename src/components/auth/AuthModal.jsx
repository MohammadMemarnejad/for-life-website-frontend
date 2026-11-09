import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, User, Phone, Lock, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AuthModal() {
  const { isAuthOpen, closeAuth, authMode, setAuthMode, login } = useAuth();
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isAuthOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!contact.trim()) {
      setError('لطفاً شماره تماس یا نام کاربری خود را وارد فرمایید.');
      return;
    }

    if (authMode === 'register' && !name.trim()) {
      setError('لطفاً نام و نام خانوادگی خود را وارد فرمایید.');
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      login(name || 'همراه گرامی', contact);
      setSuccess(false);
      setName('');
      setContact('');
      setPassword('');
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm fade-in">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FAF7F0] rounded-3xl border border-[#E7E3D8] p-7 sm:p-9 max-w-md w-full shadow-2xl relative overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={closeAuth}
          className="absolute top-5 left-5 text-stone-400 hover:text-stone-750 p-1.5 rounded-full hover:bg-stone-200/50 transition-colors"
          aria-label="بستن"
        >
          <X size={20} />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white p-2 shadow-sm border border-[#E7E3D8] mb-3 flex items-center justify-center">
            <img src="/favicon.png" alt="آیکون دمی برای زیستن" className="w-full h-full object-contain" />
          </div>
          <h3 className="text-xl font-bold text-[#222D42]">
            {authMode === 'login' ? 'ورود به «دَمی برای زیستن»' : 'عضویت در جمع همراهان'}
          </h3>
          <p className="text-xs text-[#707A65]">
            {authMode === 'login'
              ? 'برای دسترسی به رویدادها و ارتباط با جمع'
              : 'تنها با یک شماره تماس، عضوی از خانواده آرامش و ادبیات شوید'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-white rounded-2xl border border-[#E7E3D8] mb-6">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setError('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
              authMode === 'login'
                ? 'bg-olive-700 text-white shadow-sm'
                : 'text-[#707A65] hover:text-navy-900'
            }`}
          >
            ورود سریع
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setError('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
              authMode === 'register'
                ? 'bg-olive-700 text-white shadow-sm'
                : 'text-[#707A65] hover:text-navy-900'
            }`}
          >
            عضویت جدید
          </button>
        </div>

        {/* Success Feedback */}
        {success ? (
          <div className="py-8 text-center space-y-3 fade-in">
            <CheckCircle2 size={42} className="text-olive-700 mx-auto" />
            <h4 className="text-base font-bold text-olive-900">
              خوش آمدید! ورود با موفقیت انجام شد.
            </h4>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-navy-800 mb-1.5">
                  نام و نام خانوادگی *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="مثلاً: سهراب سپهری"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-[#E7E3D8] bg-white text-sm focus:outline-none focus:border-olive-600 transition-colors"
                  />
                  <User size={16} className="absolute right-3.5 top-3 text-stone-400" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-navy-800 mb-1.5">
                شماره تماس یا آیدی اینستاگرام *
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="0913... یا @username"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-[#E7E3D8] bg-white text-sm focus:outline-none focus:border-olive-600 transition-colors dir-ltr text-right"
                />
                <Phone size={16} className="absolute right-3.5 top-3 text-stone-400" />
              </div>
            </div>

            {authMode === 'login' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-navy-800">
                    رمز عبور (یا کد تأیید)
                  </label>
                  <span className="text-[10px] text-stone-400">اختیاری در نسخه آزمایشی</span>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-[#E7E3D8] bg-white text-sm focus:outline-none focus:border-olive-600 transition-colors dir-ltr text-right"
                  />
                  <Lock size={16} className="absolute right-3.5 top-3 text-stone-400" />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-6 rounded-xl bg-navy-800 hover:bg-navy-900 text-white text-sm font-medium transition-all shadow-sm flex items-center justify-center gap-2 mt-2"
            >
              <Sparkles size={14} className="text-olive-300" />
              <span>{authMode === 'login' ? 'ورود به حساب' : 'تکمیل عضویت'}</span>
            </button>
          </form>
        )}

        {/* Footer info note */}
        <div className="mt-6 pt-4 border-t border-[#E7E3D8] text-center text-[11px] text-[#8C9681]">
          اطلاعات شما صرفاً جهت هماهنگی دورهمی‌های «دمی برای زیستن» محفوظ خواهد ماند.
        </div>
      </div>
    </div>
  );
}
