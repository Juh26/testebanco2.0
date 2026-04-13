import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { supabase } from '../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [termoBusca, setTermoBusca] = useState('');

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
   
  const [carrinho, setCarrinho] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [quantidade, setQuantidade] = useState(1);

    try {
      const payload = {
        nome: novoProduto.nome,
        categoria: novoProduto.categoria,
        preco: Number(novoProduto.preco),
        estoque: Number(novoProduto.estoque)
      };

      if (produtoEditandoId) {
        await supabase.from('produtos').update(payload).eq('id', produtoEditandoId);
        toast.success('Produto atualizado');
      } else {
        await supabase.from('produtos').insert([payload]);
        toast.success('Produto criado');
      }

      setIsModalOpen(false);
      buscarProdutos();
    } catch (error) {
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

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Gerenciar Peças</h1>
            <p className="text-sm text-gray-500">
              Controle de estoque e cadastro
            </p>
          </div>

          <button
            onClick={handleAbrirModalNovo}
            className="bg-green-800 text-white px-4 py-2 rounded-md text-sm"
          >
            + Nova Peça
          </button>
        </div>

        {/* SEARCH */}
        <div className="mb-6">
          <input
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            placeholder="Buscar produto..."
            className="w-full max-w-md px-4 py-3 border rounded-md"
          />
        </div>

        {/* TABLE */}
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
                  <td colSpan="5" className="text-center p-6">
                    Carregando...
                  </td>
                </tr>
              ) : produtosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center p-6">
                    Nenhum produto encontrado
                  </td>
                </tr>
              ) : (
                produtosFiltrados.map((p) => (
                  <tr key={p.id} className="border-t hover:bg-gray-50">
                    <td className="p-4 font-medium">{p.nome}</td>
                    <td className="text-gray-500">{p.categoria}</td>
                    <td className="text-green-700 font-medium">
                      R$ {Number(p.preco).toFixed(2)}
                    </td>
                    <td className="text-gray-500">{p.estoque}</td>

                    <td className="text-right pr-4 text-xs">
                      <button
                        onClick={() => handleAbrirModalEditar(p)}
                        className="text-blue-600 mr-3"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => handleExcluirProduto(p.id)}
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
              {produtoEditandoId ? 'Editar Peça' : 'Nova Peça'}
            </h2>

            <form onSubmit={handleSalvarProduto} className="space-y-4">

              <input
                placeholder="Nome"
                value={novoProduto.nome}
                onChange={(e) =>
                  setNovoProduto({ ...novoProduto, nome: e.target.value })
                }
                className="w-full border p-3 rounded-md"
                required
              />

              {/* ✅ CATEGORIA COM SELECT */}
              <select
                value={novoProduto.categoria}
                onChange={(e) =>
                  setNovoProduto({ ...novoProduto, categoria: e.target.value })
                }
                className="w-full border p-3 rounded-md bg-white"
                required
              >
                <option value="">Selecione uma categoria</option>
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
                <option value="unissex">Unissex</option>
              </select>

              <input
                type="number"
                placeholder="Preço"
                value={novoProduto.preco}
                onChange={(e) =>
                  setNovoProduto({ ...novoProduto, preco: e.target.value })
                }
                className="w-full border p-3 rounded-md"
                required
              />

              <input
                type="number"
                placeholder="Estoque"
                value={novoProduto.estoque}
                onChange={(e) =>
                  setNovoProduto({ ...novoProduto, estoque: e.target.value })
                }
                className="w-full border p-3 rounded-md"
                required
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