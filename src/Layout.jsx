

import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import IconPropietarios from "./assets/images/icons/propietarios.svg";
import IconPagos from "./assets/images/icons/pagos.svg";
import IconoRecibos from "./assets/images/icons/recibos.svg";
import IconMovimientos from "./assets/images/icons/movimientos.svg";
import IconReservas from "./assets/images/icons/reservas.svg";
import IconComunicaciones from "./assets/images/icons/comunicaciones.svg";
import IconDocumentos from "./assets/images/icons/documentos.svg";
import IconDashboard from "./assets/images/icons/dashboard.svg";
import IconUsuarios from "./assets/images/icons/usuarios.svg";
import IconAcercaDe from "./assets/images/icons/acercade.svg";

const navLinks = [
  {
    to: "/propietarios",
    icon: <img src={IconPropietarios} alt="Propietarios" className="w-6 h-6" />,
    label: "Propietarios",
  },
  {
    to: "/pagos",
    icon: <img src={IconPagos} alt="Pagos" className="w-6 h-6" />,
    label: "Pagos y Facturación",
  },
  {
    to: "/recibos",
    icon: <img src={IconoRecibos} alt="Recibos" className="w-6 h-6" />,
    label: "Recibos",
  },
  {
    to: "/movimientos",
    icon: <img src={IconMovimientos} alt="Movimientos" className="w-6 h-6" />,
    label: "Movimientos",
  },
  {
    to: "/Reservas",
    icon: <img src={IconReservas} alt="Reservas" className="w-6 h-6" />,
    label: "Reservas",
  },
  {
    to: "/comunicaciones",
    icon: <img src={IconComunicaciones} alt="Comunicaciones" className="w-6 h-6" />,
    label: "Comunicaciones",
  },
  {
    to: "/documentos",
    icon: <img src={IconDocumentos} alt="Documentos" className="w-6 h-6" />,
    label: "Documentos",
  },
  {
    to: "/",
    icon: <img src={IconDashboard} alt="Dashboard" className="w-6 h-6" />,
    label: "Dashboard",
  },
  {
    to: "/usuarios",
    icon: <img src={IconUsuarios} alt="Usuarios" className="w-6 h-6" />,
    label: "Usuarios",
  },
  {
    to: "/acercade",
    icon: <img src={IconAcercaDe} alt="Acerca de" className="w-6 h-6" />,
    label: "Acerca de",
  },
];

const Layout = ({ children }) => {
  const [asideOpen, setAsideOpen] = useState(true); // desktop aside
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // mobile navbar

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar superior solo en móvil */}
      <div className="md:hidden bg-gray-800 text-white flex items-center justify-between h-16 px-4 border-b border-gray-700">
        <div className="flex items-center gap-2 font-bold text-lg">
          <img src="./Logo.webp" alt="Logo" className="w-8 h-8" />
          <span>Condominio</span>
        </div>
        <button
          className="text-2xl focus:outline-none"
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label="Abrir menú"
        >
          ☰
        </button>
      </div>
      {/* Menú desplegable móvil */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-800 text-white border-b border-gray-700 animate-fade-in-down">
          <nav className="flex flex-col p-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 py-2 px-3 rounded transition-all duration-150 ${isActive ? 'bg-gray-900 text-primary font-semibold' : 'hover:bg-gray-700'}`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="text-xl">{link.icon}</span>
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      )}
      <div className="flex flex-1">
        {/* Aside desktop */}
        <aside
          className={`bg-gray-800 text-white flex-shrink-0 hidden md:flex flex-col transition-all duration-200 ${asideOpen ? "w-56" : "w-20"}`}
        >
          {/* Botón de colapsar/expandir */}
          <div className="h-16 flex items-center border-b border-gray-700 px-4">
            <button
              className="text-2xl mr-2 focus:outline-none flex items-center justify-center"
              onClick={() => setAsideOpen((v) => !v)}
              aria-label={asideOpen ? "Cerrar menú" : "Abrir menú"}
            >
              <img src="./Logo.webp" alt="Logo" className="w-8 h-8" />
            </button>
            {asideOpen && (
              <span className="font-bold text-lg ml-2">Condominio</span>
            )}
          </div>
          <nav className="flex-1 p-2 space-y-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 py-2 px-2 rounded transition-all duration-150 ${asideOpen ? "justify-start" : "justify-center"} ${isActive ? 'bg-gray-900 text-primary font-semibold' : 'hover:bg-gray-700'}`
                }
              >
                <span className="text-xl">{link.icon}</span>
                {asideOpen && <span>{link.label}</span>}
              </NavLink>
            ))}
          </nav>
        </aside>
        {/* Main: contenido dinámico */}
        <main className="flex-1 bg-gray-100 p-4 overflow-auto">
          {children}
        </main>
      </div>
      {/* Footer fijo */}
      <footer className="bg-gray-900 text-gray-200 text-center py-2">
        © {new Date().getFullYear()} CondominioWeb. Todos los derechos reservados. - Desarrollado por AppJorge.com
      </footer>
    </div>
  );
};

export default Layout;
