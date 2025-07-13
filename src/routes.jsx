import { Routes, Route } from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import Pagos from './pages/Pagos';
import Propietarios from './pages/Propietarios';
import Recibos from './pages/Recibos';
import Movimientos from './pages/Movimientos';
import Reservas from './pages/Reservas';
import Comunicaciones from './pages/Comunicaciones';
import Documentos from './pages/Documentos';
import Usuarios from './pages/Usuarios';
import AcercaDe from './pages/AcercaDe';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/pagos" element={<Pagos />} />
      <Route path="/propietarios" element={<Propietarios />} />
      <Route path="/recibos" element={<Recibos />} />
      <Route path="/movimientos" element={<Movimientos />} />
      <Route path="/reservas" element={<Reservas />} />
      <Route path="/comunicaciones" element={<Comunicaciones />} />
      <Route path="/documentos" element={<Documentos />} />
      <Route path="/usuarios" element={<Usuarios />} />
      <Route path="/acercade" element={<AcercaDe />} />
    </Routes>
  );
}

export default AppRoutes;