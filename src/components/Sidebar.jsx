import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase'; 

export default function Sidebar() {
  const location = useLocation(); 
  const navigate = useNavigate(); 
  
  const handleSair = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/login'); 
    } catch (error) {
      console.error("Erro ao tentar sair:", error.message);
      alert("Erro ao sair do sistema.");
    }
  };

  const menuItems = [
    { label: 'Início', path: '/' },
    { label: 'Produtos', path: '/produtos' },
    { label: 'Clientes', path: '/clientes' },
    { label: 'Vendas', path: '/vendas' },
    { label: 'Relatórios', path: '/relatorios' },
  ];

  return (
    // Fundo branco com borda sutil à direita para separar do conteúdo creme
    <aside className="w-64 bg-white border-r border-[#F0EFEA] text-[#4A4A4A] flex flex-col min-h-screen font-sans">
      
      <div className="p-8">
        {/* Título com fonte Serifada como o "Frente de Caixa" */}
        <h2 className="text-2xl font-serif text-[#2C2C2C] tracking-tight text-center">
          Meu Sistema
        </h2>
        <div className="h-px bg-[#F0EFEA] mt-6 w-full"></div>
      </div>

      <nav className="flex-1 mt-2">
        <ul className="space-y-1 px-4">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link 
                  to={item.path} 
                  className={`block px-5 py-3 rounded-sm text-[10px] font-bold uppercase tracking-[2px] transition-all duration-300 ${
                    isActive 
                      ? 'bg-[#5B6D5B] text-white shadow-sm' // Verde Oliva para o item ativo
                      : 'text-[#AFAFAF] hover:text-[#5B6D5B] hover:bg-[#F8F7F2]'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Rodapé da Sidebar com botão Sair */}
      <div className="p-4 mb-6 border-t border-[#F0EFEA]">
        <button 
          onClick={handleSair}
          className="w-full text-left px-5 py-3 text-[#AFAFAF] hover:text-red-500 hover:bg-red-50 rounded-sm transition-all duration-200 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[2px]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sair do sistema
        </button>
      </div>
    </aside>
  );
}