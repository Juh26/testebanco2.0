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

  useEffect(() => {
    buscarDadosGerais();
  }, []);

  const buscarDadosGerais = async () => {
    try {
      const { data: dadosClientes, error: erroClientes } = await supabase
        .from('clientes')
        .select('*')
        .order('nome', { ascending: true });
      if (erroClientes) throw erroClientes;
      setClientes(dadosClientes);

      const { data: dadosProdutos, error: erroProdutos } = await supabase
        .from('produtos')
        .select('*')
        .order('nome', { ascending: true });
      if (erroProdutos) throw erroProdutos;
      setProdutos(dadosProdutos);

    } catch (error) {
      console.error("Erro ao buscar dados:", error.message);
      toast.error("Erro ao carregar clientes e produtos.");
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
    const precoNumber = parseFloat(produtoInfo.preco);
    const qtdNumber = parseInt(quantidade);
    const subtotal = precoNumber * qtdNumber;
    const novoItem = {
      produto_id: produtoInfo.id,
      nome: produtoInfo.nome,
      quantidade: qtdNumber,
      preco_unitario: precoNumber,
      subtotal: subtotal,
      idTemporario: Date.now()
    };
    setCarrinho([...carrinho, novoItem]);
    setProdutoSelecionado('');
    setQuantidade(1);
  };

  const handleRemoverDoCarrinho = (idTemp) => {
    setCarrinho(carrinho.filter(item => item.idTemporario !== idTemp));
  };

  const valorTotalVenda = carrinho.reduce((total, item) => total + item.subtotal, 0);

  const handleFinalizarVenda = async () => {
    if (!clienteSelecionado) {
      toast.error("Por favor, selecione um cliente.");
      return;
    }
    if (carrinho.length === 0) {
      toast.error("Adicione pelo menos um produto ao carrinho.");
      return;
    }
    setSalvando(true);
    try {
      const { data: vendaCadastrada, error: erroVenda } = await supabase
        .from('vendas')
        .insert([{ 
          cliente_id: clienteSelecionado, 
          valor_total: valorTotalVenda 
        }])
        .select()
        .single();
      if (erroVenda) throw erroVenda;
      const vendaId = vendaCadastrada.id;
      const itensParaSalvar = carrinho.map(item => ({
        venda_id: vendaId,
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario,
        subtotal: item.subtotal
      }));
      const { error: erroItens } = await supabase
        .from('itens_venda')
        .insert(itensParaSalvar);
      if (erroItens) throw erroItens;
      
      Swal.fire({
        title: 'Venda Finalizada!',
        text: `A venda no valor de R$ ${valorTotalVenda.toFixed(2)} foi salva com sucesso.`,
        icon: 'success',
        confirmButtonColor: '#5B705B' // Verde Oliva da foto
      });
      setClienteSelecionado('');
      setCarrinho([]);
    } catch (error) {
      console.error("Erro ao finalizar venda:", error.message);
      toast.error("Ocorreu um erro ao salvar a venda.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="flex bg-[#F9F7F2] min-h-screen w-full relative font-sans text-[#4A4A4A]">
      <Sidebar />
      <Toaster position="top-right" />

      {/* Estilos Baseados na Imagem */}
      <style dangerouslySetInnerHTML={{ __html: `
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #D1CEC5; border-radius: 10px; }
        select, input { transition: all 0.3s ease; border-color: #E2E0D6 !important; }
        select:focus, input:focus { border-color: #5B705B !important; box-shadow: 0 0 0 4px rgba(91, 112, 91, 0.05) !important; outline: none; }
      `}} />

      <main className="flex-1 p-8 lg:p-12">
        <header className="mb-10">
            <h1 className="text-2xl font-serif text-[#3D3D3D] tracking-tight">Frente de Caixa (PDV)</h1>
            <p className="text-sm text-[#8E8C84] mt-1">Realize vendas rápidas e acompanhe seu estoque em tempo real</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          <div className="lg:col-span-2 space-y-8">
            {/* Bloco do Cliente */}
            <div className="bg-white p-8 rounded-sm shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-[#EBE9E1]">
              <h2 className="text-sm font-bold text-[#3D3D3D] uppercase tracking-widest mb-6 flex items-center gap-3">
                <span className="w-6 h-[1px] bg-[#D1CEC5]"></span>
                Selecione o Cliente
              </h2>
              <select 
                className="w-full border rounded-md px-4 py-3 bg-[#FCFBFA] text-[#5C5C5C] text-sm"
                value={clienteSelecionado}
                onChange={(e) => setClienteSelecionado(e.target.value)}
              >
                <option value="">-- Escolha um cliente --</option>
                {clientes.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
                ))}
              </select>
            </div>

            {/* Bloco do Produto */}
            <div className="bg-white p-8 rounded-sm shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-[#EBE9E1]">
              <h2 className="text-sm font-bold text-[#3D3D3D] uppercase tracking-widest mb-6 flex items-center gap-3">
                <span className="w-6 h-[1px] bg-[#D1CEC5]"></span>
                Adicionar Peças
              </h2>
              <form onSubmit={handleAdicionarAoCarrinho} className="flex flex-wrap md:flex-nowrap items-end gap-5">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-[10px] font-bold text-[#8E8C84] uppercase tracking-tighter mb-2 ml-1">Produto / Peça</label>
                  <select 
                    className="w-full border rounded-md px-4 py-3 bg-[#FCFBFA] text-[#5C5C5C] text-sm"
                    value={produtoSelecionado}
                    onChange={(e) => setProdutoSelecionado(e.target.value)}
                  >
                    <option value="">-- Buscar produto --</option>
                    {produtos.map(produto => (
                      <option key={produto.id} value={produto.id}>
                        {produto.nome} — R$ {parseFloat(produto.preco).toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="w-full md:w-24">
                  <label className="block text-[10px] font-bold text-[#8E8C84] uppercase tracking-tighter mb-2 ml-1">Qtd.</label>
                  <input 
                    type="number" 
                    min="1" 
                    className="w-full border rounded-md px-4 py-3 bg-[#FCFBFA] text-[#5C5C5C] text-sm text-center"
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full md:w-auto bg-[#5B705B] hover:bg-[#4A5C4A] text-white text-xs font-bold uppercase tracking-widest py-4 px-10 rounded-full transition-all active:scale-95"
                >
                  Adicionar
                </button>
              </form>
            </div>
          </div>

          {/* Lado Direito: Carrinho e Fechamento */}
          <div className="bg-white p-8 rounded-sm shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-[#EBE9E1] flex flex-col relative h-fit">
            
            <h2 className="text-sm font-bold text-[#3D3D3D] uppercase tracking-widest mb-8 flex justify-between items-center">
              Sua Sacola
              <span className="text-[10px] text-[#8E8C84] border-b border-[#D1CEC5]">
                {carrinho.length} {carrinho.length === 1 ? 'peça' : 'peças'}
              </span>
            </h2>
            
            <div className="flex-1 overflow-y-auto mb-8 pr-2 max-h-[350px]">
              {carrinho.length === 0 ? (
                <div className="text-center py-10">
                   <div className="text-[#D1CEC5] text-4xl mb-4 flex justify-center">
                     <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                   </div>
                   <p className="text-[#8E8C84] text-xs font-light italic">Sua sacola está vazia.</p>
                </div>
              ) : (
                <ul className="divide-y divide-[#F2F1ED]">
                  {carrinho.map(item => (
                    <li key={item.idTemporario} className="py-4 flex justify-between items-start group">
                      <div className="flex-1">
                        <p className="font-medium text-[#3D3D3D] text-sm leading-tight">{item.nome}</p>
                        <p className="text-[10px] text-[#8E8C84] mt-1">{item.quantidade} unidade(s) • R$ {item.preco_unitario.toFixed(2)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="font-semibold text-[#5B705B] text-sm">R$ {item.subtotal.toFixed(2)}</span>
                        <button 
                          onClick={() => handleRemoverDoCarrinho(item.idTemporario)} 
                          className="opacity-0 group-hover:opacity-100 text-[#D1CEC5] hover:text-red-800 transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-[#F2F1ED] pt-8">
              <div className="flex justify-between items-center mb-8">
                <span className="text-[#8E8C84] text-[10px] uppercase tracking-widest">Total Estimado</span>
                <span className="text-2xl font-serif text-[#3D3D3D]">R$ {valorTotalVenda.toFixed(2)}</span>
              </div>

              <button 
                onClick={handleFinalizarVenda}
                disabled={salvando || carrinho.length === 0}
                className="w-full bg-[#5B705B] hover:bg-[#4A5C4A] disabled:bg-[#D1CEC5] text-white text-xs font-bold uppercase tracking-widest py-5 rounded-sm shadow-sm transition-all flex justify-center items-center"
              >
                {salvando ? 'Processando...' : 'Finalizar Pedido'}
              </button>
              <p className="text-center text-[9px] text-[#B5B3AD] mt-4 uppercase tracking-tighter">Peças artesanais feitas com amor e dedicação</p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}