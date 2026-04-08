import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

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
      setErro('E-mail ou senha incorretos. Tente novamente.');
      setLoading(false);
    } else {
      navigate('/', { replace: true });
    }
  };

  return (
    // Fundo creme suave (#F8F7F2)
    <div className="min-h-screen bg-[#F8F7F2] flex items-center justify-center p-4 font-sans text-[#4A4A4A]">
      {/* Card com bordas finas e arredondamento leve como o do PDV */}
      <div className="max-w-md w-full bg-white rounded-sm border border-[#F0EFEA] shadow-sm p-10">
        
        {/* Título Serifado (#2C2C2C) */}
        <h2 className="text-3xl font-serif text-center text-[#2C2C2C] mb-2">
          Acesso ao Sistema
        </h2>
        <p className="text-center text-[#AFAFAF] text-xs uppercase tracking-widest mb-10">
          Identifique-se para continuar
        </p>

        {erro && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-sm text-sm mb-6 text-center font-medium">
            {erro}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            {/* Label no estilo das seções do PDV */}
            <label className="block text-[10px] font-bold text-[#AFAFAF] uppercase tracking-[2px] mb-2">
              E-mail institucional
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 border border-[#F0EFEA] rounded-sm bg-[#FDFDFD] focus:ring-1 focus:ring-[#5B6D5B] focus:border-[#5B6D5B] outline-none transition-all placeholder:text-gray-300"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#AFAFAF] uppercase tracking-[2px] mb-2">
              Senha de acesso
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 border border-[#F0EFEA] rounded-sm bg-[#FDFDFD] focus:ring-1 focus:ring-[#5B6D5B] focus:border-[#5B6D5B] outline-none transition-all placeholder:text-gray-300"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Botão no tom Oliva (#5B6D5B) e texto em caixa alta */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 px-4 rounded-sm shadow-sm text-white text-xs font-bold uppercase tracking-[3px] transition-all
              ${loading 
                ? 'bg-[#AFAFAF] cursor-not-allowed' 
                : 'bg-[#5B6D5B] hover:bg-[#4a5a4a] active:scale-[0.98]'}`}
          >
            {loading ? 'Validando...' : 'Entrar no Sistema'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#F0EFEA] text-center">
           <p className="text-[9px] text-[#AFAFAF] uppercase tracking-[2px]">
             Ambiente Seguro & Monitorado
           </p>
        </div>
        
      </div>
    </div>
  );
}