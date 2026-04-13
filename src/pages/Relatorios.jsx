import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { supabase } from '../lib/supabase';
import { Toaster, toast } from 'react-hot-toast';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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

  // ✅ FUNÇÃO DE EXPORTAÇÃO (ADICIONADA)
 const exportarRelatorio = async () => {
  try {
    const elemento = document.querySelector("main");

    if (!elemento) {
      toast.error("Elemento do relatório não encontrado");
      return;
    }

    const canvas = await html2canvas(elemento, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff"
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save("relatorio.pdf");

  } catch (error) {
    console.error(error);
    toast.error("Erro ao exportar relatório");
  }
};

  return (
    <div className="flex bg-[#F3F2EE] min-h-screen w-full font-sans text-[#4A4A4A]">
      <Sidebar />
      <Toaster position="top-right" />

      {/* ✅ NÃO MEXI NO SEU LAYOUT */}
      <main id="relatorio" className="flex-1 p-10">

        {/* HEADER */}
        <div className="mb-10">
          <p className="text-xs text-[#8E8C84] uppercase tracking-widest mb-2">
            Relatórios
          </p>
          <h1 className="text-3xl font-semibold text-[#2F2F2F]">
            Vendas
          </h1>
          <p className="text-sm text-[#8E8C84] mt-1">
            Acompanhe todas as vendas realizadas
          </p>
        </div>

        {/* GRID PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* TABELA */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-[#E5E3DC] p-6 shadow-sm">

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-semibold text-[#3D3D3D] uppercase tracking-widest">
                Histórico de vendas
              </h2>

              <button
                onClick={exportarRelatorio}
                className="bg-[#5B705B] hover:bg-[#4A5C4A] text-white text-xs font-bold px-4 py-2 rounded-lg transition"
              >
                Exportar relatório
              </button>
            </div>

            <div className="overflow-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-[#8E8C84] uppercase">
                    <th className="text-left pb-3">Data</th>
                    <th className="text-left pb-3">Cliente</th>
                    <th className="text-right pb-3">Valor</th>
                  </tr>
                </thead>

                <tbody className="text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan="3" className="py-10 text-center text-[#8E8C84]">
                        Carregando...
                      </td>
                    </tr>
                  ) : vendas.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="py-10 text-center text-[#8E8C84]">
                        Nenhuma venda encontrada
                      </td>
                    </tr>
                  ) : (
                    vendas.map((venda) => (
                      <tr key={venda.id} className="border-t border-[#F0EFEA] hover:bg-[#F9F8F5] transition">
                        
                        <td className="py-4">
                          {new Date(venda.created_at).toLocaleString('pt-BR')}
                        </td>

                        <td className="py-4 font-medium text-[#2F2F2F]">
                          {venda.clientes?.nome || 'Não identificado'}
                        </td>

                        <td className="py-4 text-right font-semibold text-[#5B705B]">
                          R$ {parseFloat(venda.valor_total).toFixed(2)}
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* CARD LATERAL */}
          <div className="bg-white rounded-xl border border-[#E5E3DC] p-6 shadow-sm flex flex-col justify-between">

            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-semibold text-[#3D3D3D]">
                  Resumo
                </h2>
                <span className="text-xs bg-[#F3F2EE] px-3 py-1 rounded-full text-[#8E8C84]">
                  {vendas.length} vendas
                </span>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#8E8C84]">Total</span>
                  <span className="font-semibold text-[#2F2F2F]">
                    R$ {vendas.reduce((acc, v) => acc + parseFloat(v.valor_total), 0).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#8E8C84]">Última venda</span>
                  <span>
                    {vendas[0]
                      ? new Date(vendas[0].created_at).toLocaleDateString('pt-BR')
                      : '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}