
import React, { useState } from "react";
import Crear from "../components/recibos/Crear";
import Detalles from "../components/recibos/Detalles";
import Buscar from "../components/recibos/Buscar";

function Recibos() {
  const [tab, setTab] = useState("crear");

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Gestión de Recibos</h1>
      {/* Tabs */}
      <div className="mb-6 border-b flex gap-2">
        <button
          className={`px-4 py-2 -mb-px border-b-2 font-semibold transition-colors ${tab === 'crear' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-green-600'}`}
          onClick={() => setTab('crear')}
        >Crear recibo</button>
        <button
          className={`px-4 py-2 -mb-px border-b-2 font-semibold transition-colors ${tab === 'buscar' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-green-600'}`}
          onClick={() => setTab('buscar')}
        >Buscar recibos</button>
      </div>

      {/* Contenido de los tabs */}
      {tab === 'crear' && (
        <>
          <Crear />
        </>
      )}
      {tab === 'buscar' && <Buscar />}
    </div>
  );
}

export default Recibos;
// ...existing code...
