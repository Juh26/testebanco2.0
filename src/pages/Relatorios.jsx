import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { supabase } from '../lib/supabase';
import { Toaster, toast } from 'react-hot-toast';

export default function Relatorios() {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buscarRelatorioVendas();
  }, []);

  const buscarRelatorioVendas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vendas')
        .select(`
          id,
          valor_total,
          created_at,
          clientes ( nome )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVendas(data);
    } catch (error) {
      console.error("Erro ao carregar relatório:", error.message);
      toast.error("Erro ao carregar dados do relatório.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-[#F9F7F2] min-h-screen w-full font-sans text-[#4A4A4A]">
      <Sidebar />
      <Toaster position="top-right" />

      <main className="flex-1 p-8 lg:p-12">
        {/* Cabeçalho Personalizado */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 no-print">
          <div>
            <h1 className="text-2xl font-serif text-[#3D3D3D] tracking-tight">Relatórios de Vendas</h1>
            <p className="text-[#8E8C84] text-sm mt-1 uppercase tracking-widest">Juliana Scarabelli Crochê</p>
          </div>
          
          <button 
            onClick={() => window.print()} 
            className="bg-[#5B705B] hover:bg-[#4A5C4A] text-white text-xs font-bold uppercase tracking-widest py-3 px-6 rounded-sm shadow-sm transition-all active:scale-95 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
            </svg>
            Imprimir Relatório
          </button>
        </div>

        {/* Tabela Estilizada */}
        <div className="bg-white rounded-sm shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-[#EBE9E1] overflow-hidden">
          <table className="min-w-full divide-y divide-[#EBE9E1]">
            <thead className="bg-[#FCFBFA]">
              <tr>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-[#8E8C84] uppercase tracking-widest border-b border-[#EBE9E1]">Data e Hora</th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-[#8E8C84] uppercase tracking-widest border-b border-[#EBE9E1]">Cliente</th>
                <th className="px-8 py-5 text-right text-[10px] font-bold text-[#8E8C84] uppercase tracking-widest border-b border-[#EBE9E1]">Valor da Venda</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F1ED] bg-white">
              {loading ? (
                <tr>
                  <td colSpan="3" className="px-8 py-20 text-center text-[#8E8C84] text-xs font-light italic">
                    <div className="flex flex-col items-center gap-3">
                        <svg className="animate-spin h-6 w-6 text-[#D1CEC5]" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Buscando informações...
                    </div>
                  </td>
                </tr>
              ) : vendas.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-8 py-20 text-center text-[#8E8C84] text-xs font-light italic">
                    <div className="text-[#D1CEC5] text-3xl mb-3 flex justify-center">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    Nenhuma venda encontrada no período.
                  </td>
                </tr>
              ) : (
                vendas.map((venda) => (
                  <tr key={venda.id} className="hover:bg-[#F9F7F2]/50 transition-colors group">
                    <td className="px-8 py-5 whitespace-nowrap text-xs text-[#8E8C84]">
                      {new Date(venda.created_at).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-[#3D3D3D]">
                      {venda.clientes?.nome || 'Cliente não identificado'}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-sm text-right font-semibold text-[#5B705B]">
                      R$ {parseFloat(venda.valor_total).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Rodapé do relatório (Total Acumulado) */}
        {!loading && vendas.length > 0 && (
          <div className="mt-8 flex justify-end no-print">
            <div className="bg-white p-8 rounded-sm border border-[#EBE9E1] min-w-[300px] shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col items-end">
              <span className="text-[#8E8C84] text-[10px] uppercase tracking-widest mb-2">Total acumulado</span>
              <span className="text-3xl font-serif text-[#3D3D3D]">
                R$ {vendas.reduce((acc, v) => acc + parseFloat(v.valor_total), 0).toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </main>

      {/* Estilo para impressão e personalização do scroll */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print, aside { display: none !important; }
          main { margin: 0 !important; padding: 0 !important; width: 100% !important; background: white !important; }
          .bg-white { box-shadow: none !important; border: 1px solid #EBE9E1 !important; }
          body { background: white !important; }
          table th { background: transparent !important; color: #3D3D3D !important; }
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #D1CEC5; border-radius: 10px; }
      `}} />
    </div>
  );
}