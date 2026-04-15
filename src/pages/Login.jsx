import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErro('E-mail ou senha incorretos.');
      setLoading(false);
    } else {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F5F2] font-sans">

      {/* CARD PRINCIPAL */}
      <div className="w-full max-w-md bg-white border border-gray-100 shadow-sm rounded-2xl p-8">

        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-[#2F2F2F]">
            Acesso ao Sistema
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Faça login para continuar
          </p>
        </div>

        {/* ERRO */}
        {erro && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-lg mb-5 text-center">
            {erro}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-4">

          {/* EMAIL */}
          <div>
            <label className="text-xs uppercase tracking-widest text-gray-400">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2F3E2F]/20"
              required
            />
          </div>

          {/* SENHA */}
          <div>
            <label className="text-xs uppercase tracking-widest text-gray-400">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2F3E2F]/20"
              required
            />
          </div>

          {/* BOTÃO */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white font-medium transition
              ${loading
                ? "bg-gray-400"
                : "bg-[#2F3E2F] hover:opacity-90 active:scale-[0.99]"
              }`}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

        </form>

        {/* FOOTER */}
        <div className="text-center mt-6 text-xs text-gray-400">
          Sistema de gestão • PDV
        </div>

      </div>
    </div>
  );
}
