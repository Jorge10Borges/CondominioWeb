import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

const MESES = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

function Buscar() {
  const [tipoRecibo, setTipoRecibo] = useState("mensual");
  const [mes, setMes] = useState("");
  const [anio, setAnio] = useState("");
  const [tipoReciboEspecial, setTipoReciboEspecial] = useState("");
  const [tiposEspecial, setTiposEspecial] = useState([]);
  const [juntaId, setJuntaId] = useState("");
  const [juntas, setJuntas] = useState([]);
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/tipos_recibo_especial.php`)
      .then(res => res.json())
      .then(data => setTiposEspecial(Array.isArray(data) ? data : []))
      .catch(() => setTiposEspecial([]));
    // Cargar juntas de condominio
    fetch(`${API_BASE}/juntas_condominio.php`)
      .then(res => res.json())
      .then(data => setJuntas(Array.isArray(data) ? data : []))
      .catch(() => setJuntas([]));
  }, []);

  const handleBuscar = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResultados([]);
    let params = new URLSearchParams();
    if (juntaId) params.append("juntaId", juntaId);
    params.append("tipoRecibo", tipoRecibo);
    if (tipoRecibo === "mensual") {
      if (mes) params.append("mes", mes);
      if (anio) params.append("anio", anio);
    } else if (tipoRecibo === "especial") {
      if (tipoReciboEspecial) params.append("tipoReciboEspecial", tipoReciboEspecial);
    }
    try {
      const res = await fetch(`${API_BASE}/recibos.php?${params.toString()}`);
      if (!res.ok) throw new Error("Error en la respuesta del servidor");
      const data = await res.json();
      setResultados(Array.isArray(data) ? data : []);
    } catch (err) {
      setResultados([]);
      toast.error("Error al buscar recibos. Intenta nuevamente.");
    }
    setLoading(false);
  };

  // Limpiar resultados al cambiar cualquier filtro
  useEffect(() => {
    setResultados([]);
  }, [juntaId, tipoRecibo, mes, anio, tipoReciboEspecial]);

  return (
    <div className="px-2 md:px-4 py-4">
      <h2 className="text-xl font-bold mb-4">Buscar recibos</h2>
      <form className="flex flex-wrap gap-4 mb-6 items-end" onSubmit={handleBuscar}>
        <div>
          <label htmlFor="juntaId" className="block text-sm font-semibold mb-1">Junta de condominio</label>
          <select id="juntaId" className="border rounded px-2 py-1 w-56" value={juntaId} onChange={e => setJuntaId(e.target.value)}>
            <option value="">Seleccione una junta</option>
            {juntas.map(j => (
              <option key={j.id} value={j.id}>{j.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="tipoRecibo" className="block text-sm font-semibold mb-1">Tipo de recibo</label>
          <select
            id="tipoRecibo"
            className="border rounded px-2 py-1 w-40"
            value={tipoRecibo}
            onChange={e => setTipoRecibo(e.target.value)}
          >
            <option value="mensual">Mensual</option>
            <option value="especial">Especial</option>
          </select>
        </div>
        {tipoRecibo === "mensual" && (
          <>
            <div>
              <label htmlFor="mes" className="block text-sm font-semibold mb-1">Mes</label>
              <select
                id="mes"
                className="border rounded px-2 py-1"
                value={mes}
                onChange={e => setMes(e.target.value)}
              >
                <option value="">Mes</option>
                <option value="1">Enero</option>
                <option value="2">Febrero</option>
                <option value="3">Marzo</option>
                <option value="4">Abril</option>
                <option value="5">Mayo</option>
                <option value="6">Junio</option>
                <option value="7">Julio</option>
                <option value="8">Agosto</option>
                <option value="9">Septiembre</option>
                <option value="10">Octubre</option>
                <option value="11">Noviembre</option>
                <option value="12">Diciembre</option>
              </select>
            </div>
            <div>
              <label htmlFor="anio" className="block text-sm font-semibold mb-1">Año</label>
              <input
                id="anio"
                type="number"
                className="border rounded px-2 py-1 w-24"
                min="2000"
                max="2100"
                placeholder="Año"
                value={anio}
                onChange={e => setAnio(e.target.value)}
              />
            </div>
          </>
        )}
        {tipoRecibo === "especial" && (
          <div>
            <label htmlFor="tipoReciboEspecial" className="block text-sm font-semibold mb-1">Tipo de recibo especial</label>
            <select
              id="tipoReciboEspecial"
              className="border rounded px-2 py-1 w-56"
              value={tipoReciboEspecial}
              onChange={e => setTipoReciboEspecial(e.target.value)}
            >
              <option value="">Seleccione un tipo</option>
              {tiposEspecial.map(tipo => (
                <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
              ))}
            </select>
          </div>
        )}
        <div className="mt-6">
          <button
            type="submit"
            className={`bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 cursor-pointer${(!juntaId || !tipoRecibo || loading) ? ' opacity-60 cursor-not-allowed' : ''}`}
            disabled={!juntaId || !tipoRecibo || loading}
          >
            {loading ? "Buscando..." : "Buscar"}
          </button>
        </div>
      </form>
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Resultados</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-1 py-1 w-1 whitespace-nowrap">ID</th>
                {tipoRecibo === "mensual" && <th className="border px-1 py-1 w-1 whitespace-nowrap">Mes</th>}
                {tipoRecibo === "mensual" && <th className="border px-1 py-1 w-1 whitespace-nowrap">Año</th>}
                {tipoRecibo === "especial" && <th className="border px-2 py-1 w-auto whitespace-nowrap">Tipo</th>}
                <th className="border px-2 py-1">Observación</th>
                <th className="border px-1 py-1 w-1 text-right">Total</th>
                <th className="border px-2 py-1 w-1 whitespace-nowrap">Fecha</th>
                <th className="border px-2 py-1 w-1 whitespace-nowrap">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {resultados.map((r) => {
                // Formatear fecha a dd/MMM/YYYY
                let fechaFormateada = "-";
                if (r.fecha_creacion || r.fecha) {
                  const fecha = new Date(r.fecha_creacion || r.fecha);
                  if (!isNaN(fecha)) {
                    const dia = fecha.getDate().toString().padStart(2, '0');
                    const mes = fecha.toLocaleString('es-ES', { month: 'short' });
                    const anio = fecha.getFullYear();
                    fechaFormateada = `${dia}/${mes.charAt(0).toUpperCase() + mes.slice(1)}/${anio}`;
                  }
                }
                return (
                  <tr key={r.id}>
                    <td className="border px-1 py-1 w-1 whitespace-nowrap">{String(r.id).padStart(5, '0')}</td>
                    {tipoRecibo === "mensual" && (
                      <td className="border px-1 py-1 w-1 whitespace-nowrap">{
                        r.mes_nombre || (r.mes ? MESES[parseInt(r.mes, 10)] : "-")
                      }</td>
                    )}
                    {tipoRecibo === "mensual" && <td className="border px-1 py-1 w-1 whitespace-nowrap">{r.anio || "-"}</td>}
                    {tipoRecibo === "especial" && (
                      <td className="border px-2 py-1 w-auto whitespace-nowrap">{r.tipo_nombre || r.tipo || "-"}</td>
                    )}
                    <td className="border px-2 py-1">{r.observacion || '-'}</td>
                    <td className="border px-2 py-1 text-right">{r.total !== undefined && r.total !== null ? Number(r.total).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</td>
                    <td className="border px-2 py-1 w-1 whitespace-nowrap text-right">{fechaFormateada}</td>
                    <td className="border px-2 py-1">
                      <button
                        className="mr-2 cursor-pointer group"
                        title="Ver"
                        onClick={() => {}}
                      >
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline w-5 h-5 align-middle cursor-pointer text-blue-500 group-hover:text-blue-700 transition-colors">
                          <path d="M9 4.45962C9.91153 4.16968 10.9104 4 12 4C16.1819 4 19.028 6.49956 20.7251 8.70433C21.575 9.80853 22 10.3606 22 12C22 13.6394 21.575 14.1915 20.7251 15.2957C19.028 17.5004 16.1819 20 12 20C7.81811 20 4.97196 17.5004 3.27489 15.2957C2.42496 14.1915 2 13.6394 2 12C2 10.3606 2.42496 9.80853 3.27489 8.70433C3.75612 8.07914 4.32973 7.43025 5 6.82137" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
                          <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="currentColor" strokeWidth="1.5"></path>
                        </svg>
                      </button>
                      <button
                        title="Eliminar"
                        onClick={() => {}}
                        className="cursor-pointer group"
                      >
                        <svg className="inline text-red-500 hover:text-red-700 h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20.5001 6H3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          <path d="M9.5 11L10 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          <path d="M14.5 11L14 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          <path d="M6.5 6C6.55588 6 6.58382 6 6.60915 5.99936C7.43259 5.97849 8.15902 5.45491 8.43922 4.68032C8.44784 4.65649 8.45667 4.62999 8.47434 4.57697L8.57143 4.28571C8.65431 4.03708 8.69575 3.91276 8.75071 3.8072C8.97001 3.38607 9.37574 3.09364 9.84461 3.01877C9.96213 3 10.0932 3 10.3553 3H13.6447C13.9068 3 14.0379 3 14.1554 3.01877C14.6243 3.09364 15.03 3.38607 15.2493 3.8072C15.3043 3.91276 15.3457 4.03708 15.4286 4.28571L15.5257 4.57697C15.5433 4.62992 15.5522 4.65651 15.5608 4.68032C15.841 5.45491 16.5674 5.97849 17.3909 5.99936C17.4162 6 17.4441 6 17.5 6" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M18.3735 15.3991C18.1965 18.054 18.108 19.3815 17.243 20.1907C16.378 21 15.0476 21 12.3868 21H11.6134C8.9526 21 7.6222 21 6.75719 20.1907C5.89218 19.3815 5.80368 18.054 5.62669 15.3991L5.16675 8.5M18.8334 8.5L18.6334 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
export default Buscar;
