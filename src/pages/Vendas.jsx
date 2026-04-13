import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { supabase } from '../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function Vendas() {
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState('');
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [carrinho, setCarrinho] = useState([]);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => { buscarDadosGerais(); }, []);

  const buscarDadosGerais = async () => {
    try {
      const { data: dadosClientes, error: erroClientes } = await supabase
        .from('clientes').select('*').order('nome', { ascending: true });
      if (erroClientes) throw erroClientes;
      setClientes(dadosClientes);

      const { data: dadosProdutos, error: erroProdutos } = await supabase
        .from('produtos').select('*').order('nome', { ascending: true });
      if (erroProdutos) throw erroProdutos;
      setProdutos(dadosProdutos);
    } catch (error) {
      toast.error("Erro ao carregar dados.");
    }
  };

  const handleAdicionarAoCarrinho = (e) => {
    e.preventDefault();
    if (!produtoSelecionado || quantidade <= 0) {
      toast.error("Selecione um produto e uma quantidade válida.");
      return;
    }
    const produtoInfo = produtos.find(p => p.id.toString() === produtoSelecionado);
    if (!produtoInfo) return;

    const qtdNumber = parseInt(quantidade);
    const itemNoCarrinho = carrinho.find(item => item.produto_id === produtoInfo.id);
    const qtdJaNoCarrinho = itemNoCarrinho ? itemNoCarrinho.quantidade : 0;

    if (qtdJaNoCarrinho + qtdNumber > produtoInfo.estoque) {
      toast.error(`Estoque insuficiente! Disponível: ${produtoInfo.estoque - qtdJaNoCarrinho} un.`);
      return;
    }

    const precoNumber = parseFloat(produtoInfo.preco);
    setCarrinho([...carrinho, {
      produto_id: produtoInfo.id,
      nome: produtoInfo.nome,
      quantidade: qtdNumber,
      preco_unitario: precoNumber,
      subtotal: precoNumber * qtdNumber,
      idTemporario: Date.now()
    }]);
    setProdutoSelecionado('');
    setQuantidade(1);
  };

  const handleRemoverDoCarrinho = (idTemp) => {
    setCarrinho(carrinho.filter(item => item.idTemporario !== idTemp));
  };

  const valorTotalVenda = carrinho.reduce((total, item) => total + item.subtotal, 0);

  const handleFinalizarVenda = async () => {
    if (!clienteSelecionado) { toast.error("Selecione um cliente."); return; }
    if (carrinho.length === 0) { toast.error("Adicione pelo menos um produto."); return; }
    setSalvando(true);
    try {
      const { data: vendaCadastrada, error: erroVenda } = await supabase
        .from('vendas')
        .insert([{ cliente_id: clienteSelecionado, valor_total: valorTotalVenda }])
        .select().single();
      if (erroVenda) throw erroVenda;

      const { error: erroItens } = await supabase.from('itens_venda').insert(
        carrinho.map(item => ({
          venda_id: vendaCadastrada.id,
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
          subtotal: item.subtotal
        }))
      );
      if (erroItens) throw erroItens;

      for (const item of carrinho) {
        const produtoAtual = produtos.find(p => p.id === item.produto_id);
        if (!produtoAtual) continue;
        const { error } = await supabase.from('produtos')
          .update({ estoque: produtoAtual.estoque - item.quantidade })
          .eq('id', item.produto_id);
        if (error) throw error;
      }

      Swal.fire({
        title: 'Venda finalizada!',
        text: `Pedido de R$ ${valorTotalVenda.toFixed(2)} salvo com sucesso.`,
        icon: 'success',
        confirmButtonColor: '#3D4F3D'
      });
      setClienteSelecionado('');
      setCarrinho([]);
      buscarDadosGerais();
    } catch (error) {
      toast.error("Erro ao salvar a venda.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="flex bg-[#F5F4F0] min-h-screen w-full font-sans text-[#2D2D2D]">
      <Sidebar />
      <Toaster position="top-right" toastOptions={{
        style: { fontSize: '13px', borderRadius: '8px', border: '0.5px solid #E2E0D6' }
      }} />

      <style dangerouslySetInnerHTML={{ __html: `
        select, input[type="number"] {
          appearance: none; -webkit-appearance: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        select:focus, input:focus {
          outline: none;
          border-color: #4A5C4A !important;
          box-shadow: 0 0 0 3px rgba(74, 92, 74, 0.08) !important;
        }
        .cart-item { transition: background 0.15s; }
        .cart-item:hover { background: #FAFAF8; border-radius: 8px; }
        .remove-btn { opacity: 0; transition: opacity 0.2s; }
        .cart-item:hover .remove-btn { opacity: 1; }
      `}} />

      <main className="flex-1 p-8 xl:p-10 overflow-auto">

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4A5C4A]"></span>
            <p className="text-[11px] font-medium text-[#4A5C4A] uppercase tracking-widest">PDV</p>
          </div>
          <h1 className="text-xl font-medium text-[#1A1A1A] tracking-tight">Frente de caixa</h1>
          <p className="text-[13px] text-[#8A8880] mt-0.5">Realize vendas e acompanhe o estoque em tempo real</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px] gap-5">

          {/* Coluna Esquerda */}
          <div className="flex flex-col gap-4">

            {/* Card Cliente */}
            <div className="bg-white border border-[#E8E6E0] rounded-xl p-6">
              <p className="text-[11px] font-medium text-[#9A9890] uppercase tracking-widest mb-4 flex items-center gap-2">
                Cliente
                <span className="flex-1 h-px bg-[#EDEBE4]"></span>
              </p>
              <div className="relative">
                <select
                  className="w-full bg-[#FAFAF8] border border-[#E8E6E0] rounded-lg px-4 py-2.5 text-[13px] text-[#3D3D3D] pr-10 cursor-pointer"
                  value={clienteSelecionado}
                  onChange={(e) => setClienteSelecionado(e.target.value)}
                >
                  <option value="">— Selecione um cliente —</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C4C2BC] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <polyline points="6 9 12 15 18 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Card Produto */}
            <div className="bg-white border border-[#E8E6E0] rounded-xl p-6">
              <p className="text-[11px] font-medium text-[#9A9890] uppercase tracking-widest mb-4 flex items-center gap-2">
                Adicionar peças
                <span className="flex-1 h-px bg-[#EDEBE4]"></span>
              </p>
              <form onSubmit={handleAdicionarAoCarrinho}>
                <div className="flex flex-wrap md:flex-nowrap items-end gap-3">
                  <div className="flex-1 min-w-[180px]">
                    <label className="block text-[10px] font-medium text-[#B0AEA8] uppercase tracking-wider mb-1.5 ml-0.5">Produto</label>
                    <div className="relative">
                      <select
                        className="w-full bg-[#FAFAF8] border border-[#E8E6E0] rounded-lg px-4 py-2.5 text-[13px] text-[#3D3D3D] pr-10 cursor-pointer"
                        value={produtoSelecionado}
                        onChange={(e) => setProdutoSelecionado(e.target.value)}
                      >
                        <option value="">— Buscar produto —</option>
                        {produtos.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.nome} · R$ {parseFloat(p.preco).toFixed(2)}
                          </option>
                        ))}
                      </select>
                      <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C4C2BC] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <polyline points="6 9 12 15 18 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>

                  <div className="w-20">
                    <label className="block text-[10px] font-medium text-[#B0AEA8] uppercase tracking-wider mb-1.5 ml-0.5">Qtd.</label>
                    <input
                      type="number" min="1"
                      className="w-full bg-[#FAFAF8] border border-[#E8E6E0] rounded-lg px-3 py-2.5 text-[13px] text-[#3D3D3D] text-center"
                      value={quantidade}
                      onChange={(e) => setQuantidade(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-[#3D4F3D] hover:bg-[#2E3E2E] text-white text-[12px] font-medium tracking-wide py-2.5 px-6 rounded-full transition-all active:scale-95"
                  >
                    + Adicionar
                  </button>
                </div>

                <div className="flex items-center gap-2 mt-5 pt-4 border-t border-[#EDEBE4]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4A5C4A]"></span>
                  <span className="text-[11px] text-[#B0AEA8]">Estoque atualizado automaticamente ao finalizar</span>
                </div>
              </form>
            </div>

          </div>

          {/* Sacola */}
          <div className="bg-white border border-[#E8E6E0] rounded-xl p-6 flex flex-col h-fit">

            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[13px] font-medium text-[#1A1A1A]">Sacola</h2>
              <span className="text-[11px] bg-[#F2F0EA] text-[#8A8880] rounded-full px-3 py-1">
                {carrinho.length} {carrinho.length === 1 ? 'peça' : 'peças'}
              </span>
            </div>

            {/* Lista */}
            <div className="flex-1 overflow-y-auto max-h-[360px] -mx-2 px-2">
              {carrinho.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <svg className="w-8 h-8 text-[#D8D6D0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                  </svg>
                  <p className="text-[12px] text-[#C4C2BC] italic">Sua sacola está vazia</p>
                </div>
              ) : (
                <ul className="divide-y divide-[#F0EEE8]">
                  {carrinho.map(item => (
                    <li key={item.idTemporario} className="cart-item flex justify-between items-start py-3 px-2 -mx-2 rounded-lg">
                      <div className="flex-1 min-w-0 pr-3">
                        <p className="text-[13px] font-medium text-[#1A1A1A] truncate">{item.nome}</p>
                        <p className="text-[11px] text-[#9A9890] mt-0.5">
                          {item.quantidade} un. · R$ {item.preco_unitario.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className="text-[13px] font-medium text-[#3D4F3D]">
                          R$ {item.subtotal.toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleRemoverDoCarrinho(item.idTemporario)}
                          className="remove-btn text-[#D0CEC8] hover:text-red-500 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Total e Finalizar */}
            <div className="border-t border-[#EDEBE4] mt-5 pt-5">
              <div className="flex justify-between items-baseline mb-4">
                <span className="text-[11px] text-[#9A9890] uppercase tracking-wide">Total</span>
                <span className="text-[22px] font-medium text-[#1A1A1A] tracking-tight">
                  R$ {valorTotalVenda.toFixed(2)}
                </span>
              </div>
              <button
                onClick={handleFinalizarVenda}
                disabled={salvando || carrinho.length === 0}
                className="w-full bg-[#3D4F3D] hover:bg-[#2E3E2E] disabled:bg-[#D8D6D0] disabled:cursor-not-allowed text-white text-[12px] font-medium tracking-wide py-3.5 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                {salvando ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Processando...
                  </>
                ) : 'Finalizar pedido'}
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}