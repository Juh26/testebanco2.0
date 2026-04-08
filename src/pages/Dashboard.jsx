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
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

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

      if (vendasRes.error) throw vendasRes.error;
      if (produtosRes.error) throw produtosRes.error;

      const totalFinanceiro = vendasRes.data.reduce((acc, curr) => acc + Number(curr.valor_total), 0);
      const totalEstoque = produtosRes.data.reduce((acc, curr) => {
        const preco = Number(curr.preco || 0);
        const qtd = Number(curr.estoque || 0);
        return acc + (preco * (qtd > 0 ? qtd : 1));
      }, 0);

      setResumo({
        totalVendas: totalFinanceiro,
        qtdVendas: vendasRes.data.length,
        qtdClientes: clientesRes.count || 0,
        qtdProdutos: produtosRes.data.length,
        valorEstoque: totalEstoque
      });

    } catch (error) {
      console.error("Erro ao carregar resumo:", error.message);
      toast.error("Erro ao atualizar indicadores.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Fundo creme suave da imagem
    <div className="flex bg-[#F8F7F2] min-h-screen w-full font-sans text-[#4A4A4A]">
      <Sidebar />
      <Toaster position="top-right" />

      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif text-[#2C2C2C]">Painel de Controle</h1>
          {/* Botão no estilo Oliva do PDV */}
          <button 
            onClick={carregarDadosResumo}
            className="text-xs font-bold uppercase tracking-widest bg-[#5B6D5B] text-white px-6 py-2.5 rounded shadow-sm hover:bg-[#4a5a4a] transition-all"
          >
            {loading ? 'Sincronizando...' : '🔄 Atualizar Dados'}
          </button>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5B6D5B] mb-4"></div>
            <p className="text-[#AFAFAF] font-serif italic">Sincronizando com a base de dados...</p>
          </div>
        ) : (
          <div className="space-y-10">
            
            {/* SEÇÃO: INVENTÁRIO */}
            <section>
              <h2 className="text-[10px] font-bold text-[#AFAFAF] uppercase tracking-[3px] mb-6 border-b border-[#F0EFEA] pb-2">
                Gestão de Inventário
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <CardResumo title="Itens no Catálogo" value={`${resumo.qtdProdutos} un.`} color="#D4A373" />
                <CardResumo title="Valor em Estoque" value={formatarMoeda(resumo.valorEstoque)} color="#E9C46A" />
                <CardResumo title="Clientes Ativos" value={resumo.qtdClientes} color="#8D99AE" />
              </div>
            </section>

            {/* SEÇÃO: DESEMPENHO */}
            <section>
              <h2 className="text-[10px] font-bold text-[#AFAFAF] uppercase tracking-[3px] mb-6 border-b border-[#F0EFEA] pb-2">
                Desempenho Financeiro
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Faturamento */}
                <div className="bg-white p-8 rounded-sm border border-[#F0EFEA] shadow-sm flex items-center justify-between group">
                  <div>
                    <p className="text-[10px] font-bold text-[#AFAFAF] uppercase tracking-widest mb-1">Faturamento Bruto</p>
                    <p className="text-4xl font-serif text-[#5B6D5B]">{formatarMoeda(resumo.totalVendas)}</p>
                  </div>
                  <div className="text-[#E5E3D8] group-hover:text-[#5B6D5B] transition-colors">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                </div>

                {/* Pedidos */}
                <div className="bg-white p-8 rounded-sm border border-[#F0EFEA] shadow-sm flex items-center justify-between group">
                  <div>
                    <p className="text-[10px] font-bold text-[#AFAFAF] uppercase tracking-widest mb-1">Pedidos Realizados</p>
                    <p className="text-4xl font-serif text-[#2C2C2C]">{resumo.qtdVendas}</p>
                  </div>
                  <div className="text-[#E5E3D8] group-hover:text-[#5B6D5B] transition-colors">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                  </div>
                </div>
              </div>
            </section>

          </div>
        )}
      </main>
    </div>
  );
}

function CardResumo({ title, value, color }) {
  return (
    <div className="bg-white p-6 rounded-sm shadow-sm border border-[#F0EFEA] border-l-4 transition-all" style={{ borderLeftColor: color }}>
      <p className="text-[10px] font-bold text-[#AFAFAF] uppercase tracking-widest mb-2">{title}</p>
      <p className="text-2xl font-serif text-[#2C2C2C]">{value}</p>
    </div>
  );
}