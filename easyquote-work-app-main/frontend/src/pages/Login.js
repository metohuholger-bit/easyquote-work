import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, ShieldCheck, Zap } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const { login, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      window.location.replace('/');
    }
  }, [isAuthenticated, loading]);

  if (!loading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSuccess = async (credentialResponse) => {
    const success = await login(credentialResponse);

    if (success) {
      toast.success('Accesso effettuato con successo!');
      window.location.replace('/');
    } else {
      toast.error("Errore durante l'accesso. Riprova.");
    }
  };

  const handleError = () => {
    toast.error('Autenticazione con Google fallita.');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 transform">
        <div className="w-[800px] h-[400px] bg-gradient-to-r from-emerald-400 to-[#1B3A24] rounded-full blur-3xl opacity-20" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-4">
          <div className="bg-white p-3 rounded-2xl shadow-lg border border-slate-100">
            <BookOpen size={48} className="text-[#1B3A24]" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Benvenuto su EasyQuote
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Gestisci clienti, listini e preventivi in modo smart.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-white/50">
          <div className="mb-6 space-y-4">
            <div className="flex items-center gap-3 text-sm font-medium text-slate-700 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
              <ShieldCheck className="text-emerald-500" size={20} />
              <span>Dati sicuri e protetti per ogni utente</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-slate-700 bg-blue-50 p-3 rounded-xl border border-blue-100">
              <Zap className="text-blue-500" size={20} />
              <span>Generazione rapida dei preventivi in PDF</span>
            </div>
          </div>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500 font-medium">
                  Accedi per iniziare
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-center transform transition hover:scale-105 duration-200">
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
                useOneTap
                theme="filled_blue"
                shape="pill"
                size="large"
                text="continue_with"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;