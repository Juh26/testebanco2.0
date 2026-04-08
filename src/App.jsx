import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Importação das Páginas
import Login from './pages/Login'; 
import Dashboard from './pages/Dashboard'; 
import Produtos from './pages/Produtos';
import Clientes from './pages/Clientes';
import Relatorios from './pages/Relatorios';

// NOVA IMPORTAÇÃO: TELA DE VENDAS
import Vendas from './pages/Vendas';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Dashboard />} /> 
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/clientes" element={<Clientes />} />
          
          {/* === ROTA DE VENDAS === */}
          <Route path="/vendas" element={<Vendas />} />

          {/* === ROTA DE VENDAS === */}
          <Route path="/relatorios" element={<Relatorios />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}