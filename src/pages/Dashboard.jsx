import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { supabase } from '../lib/supabase';
import { Toaster, toast } from 'react-hot-toast';

export default function Dashboard() {
  const [resumo, setResumo] = useState({
    totalVendas: 0,
    qtdVendas: 0,
    qtdClientes: 0,
    qtdProdutos: 0,
    valorEstoque: 0
  });

  const [loading, setLoading] = useState(true);

  const formatarMoeda = (valor) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);

  useEffect(() => {
    carregarDadosResumo();
  }, []);

  const carregarDadosResumo = async () => {
    try {
      setLoading(true);

      const [vendasRes, clientesRes, produtosRes] = await Promise.all([
        supabase.from('vendas').select('valor_total'),
        supabase.from('clientes').select('*', { count: 'exact', head: true }),
        supabase.from('produtos').select('preco, estoque')
      ]);

      const totalFinanceiro =
        vendasRes.data?.reduce((acc, v) => acc + Number(v.valor_total), 0) || 0;

      const totalEstoque =
        produtosRes.data?.reduce((acc, p) => {
          return acc + (Number(p.preco || 0) * Number(p.estoque || 0));
        }, 0) || 0;

      setResumo({
        totalVendas: totalFinanceiro,
        qtdVendas: vendasRes.data?.length || 0,
        qtdClientes: clientesRes.count || 0,
        qtdProdutos: produtosRes.data?.length || 0,
        valorEstoque: totalEstoque
      });

    } catch (error) {
      toast.error("Erro ao carregar dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F6F5F2] font-sans text-[#2F2F2F]">

      <Sidebar />
      <Toaster position="top-right" />

      <main className="flex-1 p-8">

        {/* HEADER */}
        <div className="flex justify-between items-start mb-8">

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Painel de Controle
            </h1>
            <p className="text-sm text-gray-500">
              Visão geral do seu sistema
            </p>
          </div>

          <button
            onClick={carregarDadosResumo}
            className="bg-[#2F3E2F] text-white px-5 py-2 rounded-lg text-sm hover:opacity-90 transition"
          >
            {loading ? "Atualizando..." : "Atualizar dados"}
          </button>

        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-[#2F3E2F] rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-400 text-sm">
              Carregando informações...
            </p>
          </div>
        ) : (
          <>

            {/* CARDS PRINCIPAIS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

              <Card
                title="Produtos"
                value={resumo.qtdProdutos}
                subtitle="No catálogo"
              />

              <Card
                title="Clientes"
                value={resumo.qtdClientes}
                subtitle="Cadastrados"
              />

              <Card
                title="Pedidos"
                value={resumo.qtdVendas}
                subtitle="Realizados"
              />

              <Card
                title="Estoque"
                value={formatarMoeda(resumo.valorEstoque)}
                subtitle="Valor total"
              />

            </div>

            {/* FINANCEIRO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-xs uppercase tracking-widest text-gray-400">
                  Faturamento total
                </p>

                <h2 className="text-3xl font-semibold mt-2 text-[#2F3E2F]">
                  {formatarMoeda(resumo.totalVendas)}
                </h2>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-xs uppercase tracking-widest text-gray-400">
                  Performance geral
                </p>

                <h2 className="text-3xl font-semibold mt-2 text-gray-800">
                  {resumo.qtdVendas} vendas
                </h2>
              </div>

            </div>

          </>
        )}

      </main>
    </div>
  );
}

/* CARD MODERNO */
function Card({ title, value, subtitle }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">

      <p className="text-xs uppercase tracking-widest text-gray-400">
        {title}
      </p>

      <h3 className="text-2xl font-semibold mt-2 text-[#2F3E2F]">
        {value}
      </h3>

      <p className="text-sm text-gray-400 mt-1">
        {subtitle}
      </p>

    </div>
  );
}