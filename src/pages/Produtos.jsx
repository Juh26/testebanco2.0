import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { supabase } from '../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function Produtos() {
  // --- ESTADOS DO COMPONENTE (Todos concentrados aqui no topo) ---
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [termoBusca, setTermoBusca] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [produtoEditandoId, setProdutoEditandoId] = useState(null);

  // Estados que estavam causando erro por estarem dentro da função:
  const [carrinho, setCarrinho] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [quantidade, setQuantidade] = useState(1);

  const [novoProduto, setNovoProduto] = useState({
    nome: '',
    categoria: '',
    preco: '',
    estoque: ''
  });

  // --- EFEITOS ---
  useEffect(() => {
    buscarProdutos();
  }, []);

  // --- FUNÇÕES DE LÓGICA ---
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
      toast.error("Erro ao carregar produtos");
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
    setNovoProduto(produto);
    setIsModalOpen(true);
  };

  const handleSalvarProduto = async (e) => {
    e.preventDefault();
    setSalvando(true);
    
    // ✅ Os useState que estavam aqui foram movidos para o topo!
    // Agora a função consegue rodar sem travar o React.

    try {
      const payload = {
        nome: novoProduto.nome,
        categoria: novoProduto.categoria,
        preco: Number(novoProduto.preco),
        estoque: Number(novoProduto.estoque)
      };

      if (produtoEditandoId) {
        const { error } = await supabase
          .from('produtos')
          .update(payload)
          .eq('id', produtoEditandoId);
        
        if (error) throw error;
        toast.success('Produto atualizado');
      } else {
        const { error } = await supabase
          .from('produtos')
          .insert([payload]);
        
        if (error) throw error;
        toast.success('Produto criado');
      }

      setIsModalOpen(false);
      buscarProdutos();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar produto');
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluirProduto = async (id) => {
    const confirmacao = await Swal.fire({
      title: 'Tem certeza?',
      text: 'Essa ação não pode ser desfeita',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1e40af',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, excluir'
    });

    if (!confirmacao.isConfirmed) return;

    try {
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Produto excluído');
      buscarProdutos();
    } catch {
      toast.error('Erro ao excluir produto');
    }
  };

  const produtosFiltrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(termoBusca.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#F5F5F5] text-[#333]">
      <Sidebar />
      <Toaster position="top-right" />

      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Gerenciar Peças</h1>
            <p className="text-sm text-gray-500">Controle de estoque e cadastro</p>
          </div>

          <button
            onClick={handleAbrirModalNovo}
            className="bg-green-800 hover:bg-green-900 text-white px-4 py-2 rounded-md text-sm transition-colors"
          >
            + Nova Peça
          </button>
        </div>

        <div className="mb-6">
          <input
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            placeholder="Buscar produto..."
            className="w-full max-w-md px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-800/20"
          />
        </div>

        <div className="bg-white rounded-md shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
              <tr>
                <th className="p-4 text-left">Produto</th>
                <th className="text-left">Categoria</th>
                <th className="text-left">Preço</th>
                <th className="text-left">Estoque</th>
                <th className="text-right pr-4">Ações</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center p-6 text-gray-500">Carregando...</td>
                </tr>
              ) : produtosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center p-6 text-gray-500">Nenhum produto encontrado</td>
                </tr>
              ) : (
                produtosFiltrados.map((p) => (
                  <tr key={p.id} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium">{p.nome}</td>
                    <td className="text-gray-500">{p.categoria}</td>
                    <td className="text-green-700 font-medium">
                      R$ {Number(p.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-gray-500">{p.estoque}</td>
                    <td className="text-right pr-4 text-xs">
                      <button
                        onClick={() => handleAbrirModalEditar(p)}
                        className="text-blue-600 hover:underline mr-3"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleExcluirProduto(p.id)}
                        className="text-red-500 hover:underline"
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-lg font-semibold mb-4">
              {produtoEditandoId ? 'Editar Peça' : 'Nova Peça'}
            </h2>

            <form onSubmit={handleSalvarProduto} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nome do Produto</label>
                <input
                  placeholder="Ex: Bermuda Jeans"
                  value={novoProduto.nome}
                  onChange={(e) => setNovoProduto({ ...novoProduto, nome: e.target.value })}
                  className="w-full border p-3 rounded-md focus:ring-2 focus:ring-green-800/20 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Categoria</label>
                <select
                  value={novoProduto.categoria}
                  onChange={(e) => setNovoProduto({ ...novoProduto, categoria: e.target.value })}
                  className="w-full border p-3 rounded-md bg-white focus:ring-2 focus:ring-green-800/20 outline-none"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                  <option value="unissex">Unissex</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={novoProduto.preco}
                    onChange={(e) => setNovoProduto({ ...novoProduto, preco: e.target.value })}
                    className="w-full border p-3 rounded-md focus:ring-2 focus:ring-green-800/20 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Quantidade</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={novoProduto.estoque}
                    onChange={(e) => setNovoProduto({ ...novoProduto, estoque: e.target.value })}
                    className="w-full border p-3 rounded-md focus:ring-2 focus:ring-green-800/20 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={salvando}
                  className="bg-green-800 hover:bg-green-900 text-white px-6 py-2 rounded-md text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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