import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase'; 

export default function Sidebar() {
  const location = useLocation(); 
  const navigate = useNavigate(); 

  const handleSair = async () => {
    try {
      const { error } = await supabase.auth.signOut();  
      if (error) throw error;

      localStorage.removeItem("user");
      navigate("/login");
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
    <aside className="w-64 bg-white border-r border-gray-200 text-gray-700 flex flex-col min-h-screen font-sans">
      
      {/* Header */}
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 text-left">
          Meu Sistema
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Painel administrativo
        </p>
      </div>

      {/* Menu */}
      <nav className="flex-1">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link 
                  to={item.path} 
                  className={`block px-4 py-2 rounded-md text-sm transition-all duration-200 ${
                    isActive 
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button 
          onClick={handleSair}
          className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-md transition-all duration-200 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sair
        </button>
      </div>
    </aside>
  );
}