import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { supabase } from '../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  // Estado da Barra de Pesquisa
  const [termoBusca, setTermoBusca] = useState('');

  // Estados do Modal e Formulário
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [produtoEditandoId, setProdutoEditandoId] = useState(null);
  
  const [novoProduto, setNovoProduto] = useState({
    nome: '',
    categoria: '',
    preco: '',
    estoque: ''
  });

  useEffect(() => {
    buscarProdutos();
  }, []);

  const buscarProdutos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .order('nome', { ascending: true });

      if (error) throw error;
      setProdutos(data);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error.message);
      setErro("Não foi possível carregar a lista de produtos.");
      toast.error("Erro ao carregar produtos.");
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirModalNovo = () => {
    setProdutoEditandoId(null);
    setNovoProduto({ nome: '', categoria: '', preco: '', estoque: '' });
    setIsModalOpen(true);
  };

  const handleAbrirModalEditar = (produto) => {
    setProdutoEditandoId(produto.id);
    setNovoProduto({
      nome: produto.nome,
      categoria: produto.categoria,
      preco: produto.preco,
      estoque: produto.estoque
    });
    setIsModalOpen(true);
  };

  const handleSalvarProduto = async (e) => {
    e.preventDefault();
    setSalvando(true);

    try {
      const dadosParaSalvar = {
        nome: novoProduto.nome,
        categoria: novoProduto.categoria,
        preco: parseFloat(novoProduto.preco),
        estoque: parseInt(novoProduto.estoque, 10)
      };

      if (produtoEditandoId) {
        // Editando produto existente
        const { error } = await supabase
          .from('produtos')
          .update(dadosParaSalvar)
          .eq('id', produtoEditandoId);

        if (error) throw error;
        toast.success('Peça atualizada com sucesso!', {
          iconTheme: { primary: '#5B705B', secondary: '#fff' }
        }); 
      } else {
        // Criando novo produto
        const { error } = await supabase
          .from('produtos')
          .insert([dadosParaSalvar]);

        if (error) throw error;
        toast.success('Nova peça cadastrada!', {
          iconTheme: { primary: '#5B705B', secondary: '#fff' }
        }); 
      }

      setIsModalOpen(false);
      buscarProdutos();

    } catch (error) {
      console.error("Erro ao salvar produto:", error.message);
      toast.error("Ocorreu um erro ao salvar a peça."); 
    } finally {
      setSalvando(false);
    }
  };

  // === EXCLUIR COM SWEETALERT2 ===
  const handleExcluirProduto = (id) => {
    Swal.fire({
      title: 'Remover peça?',
      text: "Você não poderá desfazer essa ação.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#8B0000', // Vermelho escuro para exclusão
      cancelButtonColor: '#D1CEC5', // Cinza creme para cancelar
      confirmButtonText: 'Sim, remover',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-sm border border-[#EBE9E1]',
        title: 'text-serif text-[#3D3D3D]',
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const { error } = await supabase
            .from('produtos')
            .delete()
            .eq('id', id);

          if (error) throw error;
          
          toast.success('Peça removida com sucesso!', {
             iconTheme: { primary: '#5B705B', secondary: '#fff' }
          });
          buscarProdutos();

        } catch (error) {
          console.error("Erro ao excluir produto:", error.message);
          toast.error("Erro ao tentar remover a peça.");
        }
      }
    });
  };

  // Filtragem da Barra de Pesquisa
  const produtosFiltrados = produtos.filter((produto) =>
    produto.nome.toLowerCase().includes(termoBusca.toLowerCase())
  );

  return (
    <div className="flex bg-[#F9F7F2] min-h-screen w-full relative font-sans text-[#4A4A4A]">
      <Sidebar />
      <Toaster position="top-right" reverseOrder={false} />

      {/* Estilos Baseados na Imagem */}
      <style dangerouslySetInnerHTML={{ __html: `
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #D1CEC5; border-radius: 10px; }
      `}} />

      <main className="flex-1 p-8 lg:p-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-2xl font-serif text-[#3D3D3D] tracking-tight">Gerenciar Peças</h1>
        
          </div>
          <button 
            onClick={handleAbrirModalNovo}
            className="bg-[#5B705B] hover:bg-[#4A5C4A] text-white text-xs font-bold uppercase tracking-widest py-3 px-6 rounded-sm shadow-sm transition-all active:scale-95 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Nova Peça
          </button>
        </div>

        {erro && (
          <div className="mb-6 p-4 bg-[#FDF9F3] border border-[#EFE5D8] text-[#BC6C4C] text-sm rounded-sm">
            {erro}
          </div>
        )}

        {/* Barra de Pesquisa */}
        <div className="mb-8 flex">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Pesquisar peça pelo nome..."
              className="w-full pl-11 pr-4 py-3 border border-[#EBE9E1] rounded-sm bg-white text-[#5C5C5C] text-sm focus:outline-none focus:border-[#5B705B] focus:ring-0 transition-colors shadow-[0_2px_15px_rgba(0,0,0,0.01)]"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
            />
            <svg className="w-5 h-5 text-[#D1CEC5] absolute left-4 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>

        {/* Tabela de Produtos */}
        <div className="bg-white rounded-sm shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-[#EBE9E1] overflow-hidden">
          <table className="min-w-full divide-y divide-[#EBE9E1]">
            <thead className="bg-[#FCFBFA]">
              <tr>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-[#8E8C84] uppercase tracking-widest border-b border-[#EBE9E1]">Nome da Peça</th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-[#8E8C84] uppercase tracking-widest border-b border-[#EBE9E1]">Categoria</th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-[#8E8C84] uppercase tracking-widest border-b border-[#EBE9E1]">Preço</th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-[#8E8C84] uppercase tracking-widest border-b border-[#EBE9E1]">Estoque</th>
                <th className="px-8 py-5 text-right text-[10px] font-bold text-[#8E8C84] uppercase tracking-widest border-b border-[#EBE9E1]">Ações</th>
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-[#F2F1ED]">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center text-[#8E8C84] text-xs font-light italic">
                    <div className="flex flex-col items-center gap-3">
                        <svg className="animate-spin h-6 w-6 text-[#D1CEC5]" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Carregando acervo...
                    </div>
                  </td>
                </tr>
              ) : produtosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center text-[#8E8C84] text-xs font-light italic">
                    <div className="text-[#D1CEC5] text-3xl mb-3 flex justify-center">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                    </div>
                    {termoBusca ? "Nenhuma peça encontrada com esse nome." : "Nenhuma peça cadastrada no momento."}
                  </td>
                </tr>
              ) : (
                produtosFiltrados.map((produto) => (
                  <tr key={produto.id} className="hover:bg-[#F9F7F2]/50 transition duration-150 group">
                    <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-[#3D3D3D]">{produto.nome}</td>
                    <td className="px-8 py-5 whitespace-nowrap text-xs text-[#8E8C84]">{produto.categoria}</td>
                    <td className="px-8 py-5 whitespace-nowrap text-sm text-[#5B705B] font-semibold">
                      {Number(produto.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-sm">
                      <span className={`px-3 py-1 inline-flex text-[10px] uppercase tracking-widest font-bold rounded-sm border ${
                        produto.estoque > 10 
                          ? 'bg-[#FCFBFA] text-[#8E8C84] border-[#EBE9E1]' 
                          : 'bg-[#FDF9F3] text-[#BC6C4C] border-[#EFE5D8]'
                        }`}
                      >
                        {produto.estoque} un
                      </span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right text-xs font-medium">
                      <button 
                        onClick={() => handleAbrirModalEditar(produto)} 
                        className="text-[#8E8C84] hover:text-[#5B705B] mr-4 transition uppercase tracking-widest text-[10px]"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleExcluirProduto(produto.id)} 
                        className="text-[#D1CEC5] hover:text-red-800 transition uppercase tracking-widest text-[10px]"
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal Reutilizável de Produto */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#3D3D3D]/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white p-8 lg:p-10 rounded-sm shadow-[0_10px_40px_rgba(0,0,0,0.08)] w-full max-w-md border border-[#EBE9E1]">
            <h2 className="text-xl font-serif text-[#3D3D3D] mb-6 flex items-center gap-3">
              <span className="w-6 h-[1px] bg-[#D1CEC5]"></span>
              {produtoEditandoId ? 'Editar Peça' : 'Nova Peça'}
            </h2>
            
            <form onSubmit={handleSalvarProduto} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-[#8E8C84] uppercase tracking-tighter mb-2 ml-1">Nome da Peça</label>
                <input 
                  type="text" 
                  required 
                  className="w-full border border-[#EBE9E1] rounded-md px-4 py-3 bg-[#FCFBFA] text-[#5C5C5C] text-sm focus:outline-none focus:border-[#5B705B] transition-colors" 
                  value={novoProduto.nome} 
                  onChange={(e) => setNovoProduto({...novoProduto, nome: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#8E8C84] uppercase tracking-tighter mb-2 ml-1">Categoria</label>
                <input 
                  type="text" 
                  required 
                  className="w-full border border-[#EBE9E1] rounded-md px-4 py-3 bg-[#FCFBFA] text-[#5C5C5C] text-sm focus:outline-none focus:border-[#5B705B] transition-colors" 
                  value={novoProduto.categoria} 
                  onChange={(e) => setNovoProduto({...novoProduto, categoria: e.target.value})} 
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-[#8E8C84] uppercase tracking-tighter mb-2 ml-1">Preço (R$)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    required 
                    className="w-full border border-[#EBE9E1] rounded-md px-4 py-3 bg-[#FCFBFA] text-[#5C5C5C] text-sm focus:outline-none focus:border-[#5B705B] transition-colors" 
                    value={novoProduto.preco} 
                    onChange={(e) => setNovoProduto({...novoProduto, preco: e.target.value})} 
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-[#8E8C84] uppercase tracking-tighter mb-2 ml-1">Estoque</label>
                  <input 
                    type="number" 
                    min="0" 
                    required 
                    className="w-full border border-[#EBE9E1] rounded-md px-4 py-3 bg-[#FCFBFA] text-[#5C5C5C] text-sm focus:outline-none focus:border-[#5B705B] transition-colors" 
                    value={novoProduto.estoque} 
                    onChange={(e) => setNovoProduto({...novoProduto, estoque: e.target.value})} 
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-[#F2F1ED]">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-6 py-3 text-[#8E8C84] bg-transparent hover:bg-[#F2F1ED] border border-[#EBE9E1] rounded-sm text-[10px] font-bold uppercase tracking-widest transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={salvando} 
                  className="px-8 py-3 text-white bg-[#5B705B] hover:bg-[#4A5C4A] rounded-sm disabled:bg-[#D1CEC5] text-[10px] font-bold uppercase tracking-widest shadow-sm transition-all"
                >
                  {salvando ? 'Salvando...' : (produtoEditandoId ? 'Atualizar' : 'Salvar')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}