import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleCadastro = async (e) => {
    e.preventDefault();
    setErro(null);
    setSucesso(null);

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: {
          nome,
        },
      },
    });

    if (error) {
      setErro(error.message);
      setLoading(false);
    } else {
      setSucesso("Conta criada com sucesso! Verifique seu e-mail.");
      setLoading(false);

      // opcional: redirecionar depois de 2s
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F5F2] font-sans">

      <div className="w-full max-w-md bg-white border border-gray-100 shadow-sm rounded-2xl p-8">

        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-[#2F2F2F]">
            Criar Conta
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Cadastre-se para acessar o sistema
          </p>
        </div>

        {/* ERRO */}
        {erro && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-lg mb-5 text-center">
            {erro}
          </div>
        )}

        {/* SUCESSO */}
        {sucesso && (
          <div className="bg-green-50 border border-green-100 text-green-600 text-sm p-3 rounded-lg mb-5 text-center">
            {sucesso}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleCadastro} className="space-y-4">

          {/* NOME */}
          <div>
            <label className="text-xs uppercase tracking-widest text-gray-400">
              Nome
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome completo"
              className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2F3E2F]/20"
              required
            />
          </div>

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
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2F3E2F]/20"
              required
            />
          </div>

          {/* CONFIRMAR SENHA */}
          <div>
            <label className="text-xs uppercase tracking-widest text-gray-400">
              Confirmar senha
            </label>
            <input
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
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
              ${
                loading
                  ? "bg-gray-400"
                  : "bg-[#2F3E2F] hover:opacity-90 active:scale-[0.99]"
              }`}
          >
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>

        {/* LINK LOGIN */}
        <p className="text-center mt-6 text-sm text-gray-500">
          Já tem conta?{" "}
          <Link to="/login" className="text-[#2F3E2F] font-medium">
            Entrar
          </Link>
        </p>

        {/* FOOTER */}
        <div className="text-center mt-6 text-xs text-gray-400">
          Sistema de gestão • PDV
        </div>

      </div>
    </div>
  );
}
