import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserCheck, LogIn, UserPlus, Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const LandingPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi.');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated Background Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="glass-dark rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10">
          <div className="p-10 text-center relative">
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-indigo-500/10 text-indigo-400 rounded-3xl mb-6 border border-indigo-500/20"
            >
              <UserCheck className="w-10 h-10" />
            </motion.div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight font-display">
              Absensi<span className="text-indigo-400">Kita</span>
            </h1>
            <p className="text-slate-400 mt-2 text-sm font-medium">Sistem Manajemen Sekolah Masa Depan</p>
            
            <div className="absolute top-4 right-4">
              <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3" />
                Secure
              </div>
            </div>
          </div>

          <div className="px-10 pb-10">
            <AnimatePresence mode="wait">
              <motion.form 
                key={isLogin ? 'login' : 'register'}
                initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                onSubmit={handleAuth} 
                className="space-y-5"
              >
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 bg-red-500/10 text-red-400 text-xs rounded-2xl border border-red-500/20 font-medium"
                  >
                    {error}
                  </motion.div>
                )}
                
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-white placeholder:text-slate-600"
                    placeholder="name@school.edu"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-white placeholder:text-slate-600"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 disabled:opacity-70 shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isLogin ? (
                    <>
                      <LogIn className="w-5 h-5" />
                      Sign In to Dashboard
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      Create New Account
                    </>
                  )}
                </button>
              </motion.form>
            </AnimatePresence>

            <div className="mt-8 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-slate-400 hover:text-indigo-400 transition-colors font-medium flex items-center justify-center gap-2 mx-auto"
              >
                <Sparkles className="w-4 h-4 text-indigo-400" />
                {isLogin ? 'New here? Create an account' : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        </div>
        
        <p className="text-center text-slate-600 text-xs mt-8 font-medium">
          &copy; 2026 AbsensiKita. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
};
