import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { supabase } from '../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [termoBusca, setTermoBusca] = useState('');

  // Estados do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [clienteEditandoId, setClienteEditandoId] = useState(null);
  
  const [novoCliente, setNovoCliente] = useState({
    nome: '',
    email: '',
    telefone: ''
  });

  useEffect(() => {
    buscarClientes();
  }, []);

  const buscarClientes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nome', { ascending: true });

      if (error) throw error;
      setClientes(data);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error.message);
      toast.error("Erro ao carregar a lista de clientes.");
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirModalNovo = () => {
    setClienteEditandoId(null);
    setNovoCliente({ nome: '', email: '', telefone: '' });
    setIsModalOpen(true);
  };

  const handleAbrirModalEditar = (cliente) => {
    setClienteEditandoId(cliente.id);
    setNovoCliente({
      nome: cliente.nome,
      email: cliente.email || '',
      telefone: cliente.telefone || ''
    });
    setIsModalOpen(true);
  };

  const handleSalvarCliente = async (e) => {
    e.preventDefault();
    setSalvando(true);

    try {
      const dadosParaSalvar = {
        nome: novoCliente.nome,
        email: novoCliente.email,
        telefone: novoCliente.telefone
      };

      if (clienteEditandoId) {
        const { error } = await supabase
          .from('clientes')
          .update(dadosParaSalvar)
          .eq('id', clienteEditandoId);

        if (error) throw error;
        toast.success('Cliente atualizado com sucesso!', {
          iconTheme: { primary: '#5B705B', secondary: '#fff' }
        }); 
      } else {
        const { error } = await supabase
          .from('clientes')
          .insert([dadosParaSalvar]);

        if (error) throw error;
        toast.success('Novo cliente cadastrado!', {
          iconTheme: { primary: '#5B705B', secondary: '#fff' }
        }); 
      }

      setIsModalOpen(false);
      buscarClientes();

    } catch (error) {
      console.error("Erro ao salvar cliente:", error.message);
      toast.error("Ocorreu um erro ao salvar o cliente."); 
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluirCliente = (id) => {
    Swal.fire({
      title: 'Remover cliente?',
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
            .from('clientes')
            .delete()
            .eq('id', id);

          if (error) throw error;
          
          toast.success('Cliente removido com sucesso!', {
            iconTheme: { primary: '#5B705B', secondary: '#fff' }
          });
          buscarClientes();

        } catch (error) {
          console.error("Erro ao excluir cliente:", error.message);
          toast.error("Erro ao tentar remover o cliente.");
        }
      }
    });
  };

  const clientesFiltrados = clientes.filter((cliente) =>
    cliente.nome.toLowerCase().includes(termoBusca.toLowerCase())
  );

  return (
    <div className="flex bg-[#F9F7F2] min-h-screen w-full relative font-sans text-[#4A4A4A]">
      <Sidebar />
      <Toaster position="top-right" reverseOrder={false} />

      {/* Estilos Baseados na Identidade Visual */}
      <style dangerouslySetInnerHTML={{ __html: `
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #D1CEC5; border-radius: 10px; }
      `}} />

      <main className="flex-1 p-8 lg:p-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-2xl font-serif text-[#3D3D3D] tracking-tight">Gerenciar Clientes</h1>
            <p className="text-[#8E8C84] text-sm mt-1 uppercase tracking-widest">Juliana Scarabelli Crochê</p>
          </div>
          <button 
            onClick={handleAbrirModalNovo}
            className="bg-[#5B705B] hover:bg-[#4A5C4A] text-white text-xs font-bold uppercase tracking-widest py-3 px-6 rounded-sm shadow-sm transition-all active:scale-95 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Novo Cliente
          </button>
        </div>

        {/* Barra de Pesquisa */}
        <div className="mb-8 flex">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Pesquisar cliente pelo nome..."
              className="w-full pl-11 pr-4 py-3 border border-[#EBE9E1] rounded-sm bg-white text-[#5C5C5C] text-sm focus:outline-none focus:border-[#5B705B] focus:ring-0 transition-colors shadow-[0_2px_15px_rgba(0,0,0,0.01)]"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
            />
            <svg className="w-5 h-5 text-[#D1CEC5] absolute left-4 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>

        {/* Tabela de Clientes */}
        <div className="bg-white rounded-sm shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-[#EBE9E1] overflow-hidden">
          <table className="min-w-full divide-y divide-[#EBE9E1]">
            <thead className="bg-[#FCFBFA]">
              <tr>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-[#8E8C84] uppercase tracking-widest border-b border-[#EBE9E1]">Nome</th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-[#8E8C84] uppercase tracking-widest border-b border-[#EBE9E1]">E-mail</th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-[#8E8C84] uppercase tracking-widest border-b border-[#EBE9E1]">Telefone</th>
                <th className="px-8 py-5 text-right text-[10px] font-bold text-[#8E8C84] uppercase tracking-widest border-b border-[#EBE9E1]">Ações</th>
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-[#F2F1ED]">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center text-[#8E8C84] text-xs font-light italic">
                    <div className="flex flex-col items-center gap-3">
                        <svg className="animate-spin h-6 w-6 text-[#D1CEC5]" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Carregando carteira de clientes...
                    </div>
                  </td>
                </tr>
              ) : clientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center text-[#8E8C84] text-xs font-light italic">
                    <div className="text-[#D1CEC5] text-3xl mb-3 flex justify-center">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                    </div>
                    {termoBusca ? "Nenhum cliente encontrado com esse nome." : "Nenhum cliente cadastrado no momento."}
                  </td>
                </tr>
              ) : (
                clientesFiltrados.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-[#F9F7F2]/50 transition duration-150 group">
                    <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-[#3D3D3D]">{cliente.nome}</td>
                    <td className="px-8 py-5 whitespace-nowrap text-xs text-[#8E8C84]">{cliente.email || '—'}</td>
                    <td className="px-8 py-5 whitespace-nowrap text-xs text-[#8E8C84]">{cliente.telefone || '—'}</td>
                    <td className="px-8 py-5 whitespace-nowrap text-right text-xs font-medium">
                      <button 
                        onClick={() => handleAbrirModalEditar(cliente)} 
                        className="text-[#8E8C84] hover:text-[#5B705B] mr-4 transition uppercase tracking-widest text-[10px]"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleExcluirCliente(cliente.id)} 
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

      {/* Modal de Cliente */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#3D3D3D]/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white p-8 lg:p-10 rounded-sm shadow-[0_10px_40px_rgba(0,0,0,0.08)] w-full max-w-md border border-[#EBE9E1]">
            <h2 className="text-xl font-serif text-[#3D3D3D] mb-6 flex items-center gap-3">
              <span className="w-6 h-[1px] bg-[#D1CEC5]"></span>
              {clienteEditandoId ? 'Editar Cliente' : 'Novo Cliente'}
            </h2>
            
            <form onSubmit={handleSalvarCliente} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-[#8E8C84] uppercase tracking-tighter mb-2 ml-1">Nome Completo</label>
                <input 
                  type="text" 
                  required 
                  className="w-full border border-[#EBE9E1] rounded-md px-4 py-3 bg-[#FCFBFA] text-[#5C5C5C] text-sm focus:outline-none focus:border-[#5B705B] transition-colors" 
                  value={novoCliente.nome} 
                  onChange={(e) => setNovoCliente({...novoCliente, nome: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#8E8C84] uppercase tracking-tighter mb-2 ml-1">E-mail</label>
                <input 
                  type="email" 
                  className="w-full border border-[#EBE9E1] rounded-md px-4 py-3 bg-[#FCFBFA] text-[#5C5C5C] text-sm focus:outline-none focus:border-[#5B705B] transition-colors" 
                  value={novoCliente.email} 
                  onChange={(e) => setNovoCliente({...novoCliente, email: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#8E8C84] uppercase tracking-tighter mb-2 ml-1">Telefone / WhatsApp</label>
                <input 
                  type="text" 
                  placeholder="(00) 00000-0000" 
                  className="w-full border border-[#EBE9E1] rounded-md px-4 py-3 bg-[#FCFBFA] text-[#5C5C5C] text-sm focus:outline-none focus:border-[#5B705B] transition-colors" 
                  value={novoCliente.telefone} 
                  onChange={(e) => setNovoCliente({...novoCliente, telefone: e.target.value})} 
                />
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
                  {salvando ? 'Salvando...' : (clienteEditandoId ? 'Atualizar' : 'Salvar')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}