import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { supabase } from '../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [termoBusca, setTermoBusca] = useState('');

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
      toast.error("Erro ao carregar clientes");
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
    setNovoCliente(cliente);
    setIsModalOpen(true);
  };

  const handleSalvarCliente = async (e) => {
    e.preventDefault();
    setSalvando(true);

    try {
      const payload = {
        nome: novoCliente.nome,
        email: novoCliente.email,
        telefone: novoCliente.telefone
      };

      if (clienteEditandoId) {
        await supabase.from('clientes').update(payload).eq('id', clienteEditandoId);
        toast.success('Cliente atualizado');
      } else {
        await supabase.from('clientes').insert([payload]);
        toast.success('Cliente criado');
      }

      setIsModalOpen(false);
      buscarClientes();
    } catch (error) {
      toast.error('Erro ao salvar cliente');
    } finally {
      setSalvando(false);
    }
  };

  // ✅ FUNÇÃO DE EXCLUIR (AGORA FUNCIONANDO)
  const handleExcluirCliente = async (id) => {
    const confirmacao = await Swal.fire({
      title: 'Tem certeza?',
      text: 'Essa ação não pode ser desfeita',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#166534',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar'
    });

    if (!confirmacao.isConfirmed) return;

    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Cliente excluído com sucesso');
      buscarClientes();
    } catch (error) {
      toast.error('Erro ao excluir cliente');
    }
  };

  const clientesFiltrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(termoBusca.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#F5F5F5] text-[#333]">
      <Sidebar />
      <Toaster position="top-right" />

      <main className="flex-1 p-8">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Clientes</h1>
            <p className="text-sm text-gray-500">
              Gestão de clientes cadastrados
            </p>
          </div>

          <button
            onClick={handleAbrirModalNovo}
            className="bg-green-800 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
          >
            + Novo Cliente
          </button>
        </div>

        {/* SEARCH */}
        <div className="mb-6">
          <input
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            placeholder="Buscar cliente..."
            className="w-full max-w-md px-4 py-3 border rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-green-800"
          />
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-md shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr className="text-left text-xs uppercase text-gray-600">
                <th className="p-4">Nome</th>
                <th>Email</th>
                <th>Telefone</th>
                <th className="text-right pr-4">Ações</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center p-6 text-gray-400">
                    Carregando...
                  </td>
                </tr>
              ) : clientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center p-6 text-gray-400">
                    Nenhum cliente encontrado
                  </td>
                </tr>
              ) : (
                clientesFiltrados.map((c) => (
                  <tr key={c.id} className="border-t hover:bg-gray-50">
                    <td className="p-4 font-medium">{c.nome}</td>
                    <td className="text-sm text-gray-500">{c.email || '-'}</td>
                    <td className="text-sm text-gray-500">{c.telefone || '-'}</td>

                    <td className="text-right pr-4 text-xs">
                      <button
                        onClick={() => handleAbrirModalEditar(c)}
                        className="text-blue-600 mr-3"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => handleExcluirCliente(c.id)}
                        className="text-red-500"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </main>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-md shadow">

            <h2 className="text-lg font-semibold mb-4">
              {clienteEditandoId ? 'Editar Cliente' : 'Novo Cliente'}
            </h2>

            <form onSubmit={handleSalvarCliente} className="space-y-4">

              <input
                placeholder="Nome"
                value={novoCliente.nome}
                onChange={(e) => setNovoCliente({ ...novoCliente, nome: e.target.value })}
                className="w-full border p-3 rounded-md"
                required
              />

              <input
                placeholder="Email"
                value={novoCliente.email}
                onChange={(e) => setNovoCliente({ ...novoCliente, email: e.target.value })}
                className="w-full border p-3 rounded-md"
              />

              <input
                placeholder="Telefone"
                value={novoCliente.telefone}
                onChange={(e) => setNovoCliente({ ...novoCliente, telefone: e.target.value })}
                className="w-full border p-3 rounded-md"
              />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-sm"
                >
                  Cancelar
                </button>

                <button
                  disabled={salvando}
                  className="bg-green-800 text-white px-4 py-2 rounded-md text-sm"
                >
                  {salvando ? 'Salvando...' : 'Salvar'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}