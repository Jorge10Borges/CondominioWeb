
import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function Buscar() {
  const [juntas, setJuntas] = useState([]);
  const [juntaId, setJuntaId] = useState("");
  const [mes, setMes] = useState("");
  const [anio, setAnio] = useState("");
  const [recibos, setRecibos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/juntas_condominio.php`)
      .then(res => res.json())
      .then(data => setJuntas(Array.isArray(data) ? data : []))
      .catch(() => setJuntas([]));
  }, []);

  const handleBuscar = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (juntaId) params.append("juntaId", juntaId);
      if (mes) params.append("mes", mes);
      if (anio) params.append("anio", anio);
      const res = await fetch(`${API_BASE}/recibos.php?${params.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setRecibos(data);
      } else {
        setRecibos([]);
        toast.error("No se encontraron recibos.");
      }
    } catch (e) {
      toast.error("Error al buscar recibos.");
      setRecibos([]);
    }
    setLoading(false);
  };

  return (
    <div className="px-2 md:px-4 py-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 className="text-xl font-bold mb-4">Buscar recibos</h2>
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div>
          <label htmlFor="juntaId" className="block text-sm font-semibold mb-1">Junta de condominio</label>
          <select
            id="juntaId"
            className="border rounded px-2 py-1 w-56"
            value={juntaId}
            onChange={e => setJuntaId(e.target.value)}
          >
            <option value="">Seleccione una junta</option>
            {juntas.map(j => (
              <option key={j.id} value={j.id}>{j.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="mes" className="block text-sm font-semibold mb-1">Mes</label>
          <select
            id="mes"
            className="border rounded px-2 py-1"
            value={mes}
            onChange={e => setMes(e.target.value)}
          >
            <option value="">Mes</option>
            {["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"].map((m, idx) => (
              <option key={idx+1} value={idx+1}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="anio" className="block text-sm font-semibold mb-1">Año</label>
          <input
            id="anio"
            type="number"
            className="border rounded px-2 py-1 w-24"
            value={anio}
            onChange={e => setAnio(e.target.value)}
            min="2000"
            max="2100"
          />
        </div>
        <div className="mt-6">
          <button
            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 cursor-pointer"
            onClick={handleBuscar}
            disabled={loading}
          >
            {loading ? "Buscando..." : "Buscar"}
          </button>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Resultados</h2>
        {recibos.length === 0 ? (
          <div className="text-gray-500">No hay recibos para los filtros seleccionados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1">ID</th>
                  <th className="border px-2 py-1">Junta</th>
                  <th className="border px-2 py-1">Mes</th>
                  <th className="border px-2 py-1">Año</th>
                  <th className="border px-2 py-1">Tipo</th>
                  <th className="border px-2 py-1">Fecha</th>
                  <th className="border px-2 py-1">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {recibos.map(r => (
                  <tr key={r.id}>
                    <td className="border px-2 py-1">{r.id}</td>
                    <td className="border px-2 py-1">{r.junta_nombre || r.juntaId}</td>
                    <td className="border px-2 py-1">{r.mes}</td>
                    <td className="border px-2 py-1">{r.anio}</td>
                    <td className="border px-2 py-1">{r.tipo}</td>
                    <td className="border px-2 py-1">{r.fecha_creacion}</td>
                    <td className="border px-2 py-1">
                      {/* Aquí irán acciones como ver detalles, editar, eliminar */}
                      <button className="text-blue-600 hover:underline mr-2">Ver</button>
                      <button className="text-red-600 hover:underline">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Buscar;
