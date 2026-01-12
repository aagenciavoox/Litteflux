
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabase';
import { Button, Input, FormField } from './Modals';

interface AuthProps {
  onSuccess: (userId: string) => void;
  addToast: (msg: string, type?: 'SUCCESS' | 'ERROR' | 'INFO') => void;
}

const Auth: React.FC<AuthProps> = ({ onSuccess, addToast }) => {
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP' | 'FORGOT'>('LOGIN');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('litte_flux_saved_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const passwordStrength = useMemo(() => {
    if (!password) return 0;
    let strength = 0;
    if (password.length > 5) strength += 25;
    if (password.length > 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9!@#$%^&*]/.test(password)) strength += 25;
    return strength;
  }, [password]);

  const strengthColor = () => {
    if (passwordStrength <= 25) return 'bg-rose-600';
    if (passwordStrength <= 50) return 'bg-amber-600';
    if (passwordStrength <= 75) return 'bg-blue-600';
    return 'bg-emerald-600';
  };

  const getFriendlyErrorMessage = (msg: string) => {
    if (msg.includes('User already registered')) return 'Este e-mail já possui uma conta.';
    if (msg.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.';
    if (msg.includes('Email not confirmed')) return 'E-mail ainda não confirmado.';
    if (msg.includes('Password should be at least')) return 'A senha deve ter 6+ caracteres.';
    return msg || 'Ocorreu um erro inesperado.';
  };

  const handleGoogleLogin = async () => {
    setSocialLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
    } catch (err: any) {
      addToast(getFriendlyErrorMessage(err.message), 'ERROR');
      setSocialLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || (mode !== 'FORGOT' && !password)) {
      addToast('Preencha os campos obrigatórios.', 'ERROR');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'LOGIN') {
        const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        if (data.user) {
          if (rememberMe) localStorage.setItem('litte_flux_saved_email', email.trim());
          else localStorage.removeItem('litte_flux_saved_email');
          addToast('Acesso autorizado.', 'SUCCESS');
          onSuccess(data.user.id);
        }
      } else if (mode === 'SIGNUP') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: fullName }, emailRedirectTo: window.location.origin }
        });
        if (error) throw error;
        if (data.user) {
          if (data.session) {
            addToast('Conta criada!', 'SUCCESS');
            onSuccess(data.user.id);
          } else {
            addToast('Verifique seu e-mail.', 'INFO');
            setMode('LOGIN');
          }
        }
      } else if (mode === 'FORGOT') {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin });
        if (error) throw error;
        addToast('Link de recuperação enviado!', 'SUCCESS');
        setMode('LOGIN');
      }
    } catch (err: any) {
      addToast(getFriendlyErrorMessage(err.message), 'ERROR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F7F9FB] p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-md bg-white rounded-[48px] shadow-2xl border border-slate-200 p-10 md:p-12 space-y-8">
        <div className="text-center space-y-6">
          <div className="bg-[#1F7A5F] w-16 h-16 rounded-[24px] flex items-center justify-center text-white text-4xl font-black mx-auto shadow-xl ring-8 ring-emerald-50">L</div>
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-tight">Littê Flux</h2>
            <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.25em]">
              {mode === 'LOGIN' ? 'Acesso ao Sistema' : mode === 'SIGNUP' ? 'Novo Cadastro' : 'Recuperar Acesso'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'SIGNUP' && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <FormField label="Nome Completo" required>
                <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Seu nome" required />
              </FormField>
            </div>
          )}

          <FormField label="E-mail" required>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="exemplo@litte.com" required autoComplete="email" />
          </FormField>

          {mode !== 'FORGOT' && (
            <div className="space-y-5">
              <FormField label="Senha" required>
                <div className="relative group">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete={mode === 'LOGIN' ? "current-password" : "new-password"}
                    className="pr-12 text-lg tracking-widest font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1F7A5F] transition-colors outline-none"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7" />
                      )}
                    </svg>
                  </button>
                </div>
                {mode === 'SIGNUP' && password && (
                  <div className="mt-3 space-y-1.5">
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-500 ${strengthColor()}`} style={{ width: `${passwordStrength}%` }}></div>
                    </div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Segurança: {passwordStrength <= 50 ? 'Fraca' : 'Segura'}</p>
                  </div>
                )}
              </FormField>

              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 appearance-none rounded-md border-2 border-slate-200 bg-white transition-all checked:bg-[#1F7A5F] checked:border-[#1F7A5F] cursor-pointer"
                  />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-800">Lembrar e-mail</span>
                </label>
                {mode === 'LOGIN' && (
                  <button type="button" onClick={() => setMode('FORGOT')} className="text-[10px] font-black text-[#1F7A5F] uppercase tracking-widest hover:underline">Recuperar Senha</button>
                )}
              </div>
            </div>
          )}

          <Button type="submit" className="w-full py-5 text-[12px] tracking-[0.2em] font-black shadow-xl uppercase border-2 border-[#1F7A5F]" disabled={loading || socialLoading}>
            {loading ? 'Processando...' : (mode === 'LOGIN' ? 'Acessar Plataforma' : mode === 'SIGNUP' ? 'Criar minha Conta' : 'Enviar Link de Acesso')}
          </Button>
        </form>

        {mode !== 'FORGOT' && (
          <>
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em]"><span className="bg-white px-4 text-slate-400">Ou continue com</span></div>
            </div>
            <button
              onClick={handleGoogleLogin}
              disabled={loading || socialLoading}
              className="w-full flex items-center justify-center gap-4 py-4 bg-white border-2 border-slate-200 rounded-2xl hover:bg-slate-50 transition-all font-black text-[11px] uppercase tracking-widest text-slate-700"
            >
              {socialLoading ? <div className="spinner scale-75"></div> : <span>Conta Google</span>}
            </button>
          </>
        )}

        <div className="pt-6 text-center border-t border-slate-50">
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
            {mode === 'LOGIN' ? 'Não tem uma conta?' : 'Já possui uma conta?'}
            <button
              type="button"
              onClick={() => setMode(mode === 'LOGIN' ? 'SIGNUP' : 'LOGIN')}
              className="ml-2 text-[#1F7A5F] hover:underline"
            >
              {mode === 'LOGIN' ? 'Cadastre-se' : 'Fazer Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
