import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Páginas
import Login from './pages/Login'; 
import Dashboard from './pages/Dashboard'; 
import Produtos from './pages/Produtos';
import Clientes from './pages/Clientes';
import Relatorios from './pages/Relatorios';
import Vendas from './pages/Vendas';

// Proteção
import ProtectedRoute from './pages/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          {/* LOGIN */}
          <Route path="/login" element={<Login />} />

          {/* ROTAS PROTEGIDAS */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/produtos"
            element={
              <ProtectedRoute>
                <Produtos />
              </ProtectedRoute>
            }
          />

          <Route
            path="/clientes"
            element={
              <ProtectedRoute>
                <Clientes />
              </ProtectedRoute>
            }
          />

          <Route
            path="/vendas"
            element={
              <ProtectedRoute>
                <Vendas />
              </ProtectedRoute>
            }
          />

          <Route
            path="/relatorios"
            element={
              <ProtectedRoute>
                <Relatorios />
              </ProtectedRoute>
            }
          />

          {/* QUALQUER OUTRA ROTA */}
          <Route path="*" element={<Navigate to="/login" />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}