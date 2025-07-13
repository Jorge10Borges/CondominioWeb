
import React, { useState, useEffect } from "react";
import AccionesUnidad from "../components/AccionesUnidad";
// Componente Modal simple
function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded shadow-lg max-w-lg w-full p-6 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl font-bold cursor-pointer">
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function Propietarios() {
  // Estados para los selects
  const [urbanizacion, setUrbanizacion] = useState("");
  const [ubicacionId, setUbicacionId] = useState("");
  const [urbanizaciones, setUrbanizaciones] = useState([]);
  const [sectores, setSectores] = useState([]);
  const [tipoUrbanizacion, setTipoUrbanizacion] = useState(""); // 'casas' o 'edificios'

  // Cargar urbanizaciones al montar el componente
  useEffect(() => {
    fetch(`${API_BASE}/urbanizaciones.php`)
      .then((res) => res.json())
      .then((data) => setUrbanizaciones(data))
      .catch(() => setUrbanizaciones([]));
  }, []);

  // Cargar sectores cuando cambia la urbanización seleccionada
  useEffect(() => {
    setUnidades([]); // Limpiar la tabla al cambiar urbanización
    if (urbanizacion) {
      setSectores([]);
      setUbicacionId("");
      // Buscar el tipo de urbanización seleccionado
      const urb = urbanizaciones.find(u => String(u.id) === String(urbanizacion));
      setTipoUrbanizacion(urb ? urb.tipo : "");
      fetch(`${API_BASE}/sectores.php?id_urbanizacion=${urbanizacion}`)
        .then((res) => res.json())
        .then((data) => setSectores(Array.isArray(data) ? data : []))
        .catch(() => setSectores([]));
    } else {
      setSectores([]);
      setUbicacionId("");
      setTipoUrbanizacion("");
    }
  }, [urbanizacion, urbanizaciones]);

  // Estado para las unidades filtradas
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nombrePersona, setNombrePersona] = useState("");
  const [modalUnidad, setModalUnidad] = useState(null);
  const [modalPagoUnidad, setModalPagoUnidad] = useState(null);
  const [modalSituacion, setModalSituacion] = useState(null);

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Propietarios y Unidades</h1>
      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-4">
        <select
          className="border rounded px-2 py-1"
          value={urbanizacion}
          onChange={e => setUrbanizacion(e.target.value)}
        >
          <option value="">Todas las urbanizaciones</option>
          {urbanizaciones.map(u => (
            <option key={u.id} value={u.id}>{u.nombre}</option>
          ))}
        </select>
        {/* Select de sector/edificio dinámico */}
        {urbanizacion && (
          <div className="flex items-center gap-2">
            <select
              className="border rounded px-2 py-1"
              value={ubicacionId}
              onChange={e => {
                setUbicacionId(e.target.value);
                setUnidades([]); // Limpiar la tabla al cambiar sector
              }}
              disabled={sectores.length === 0}
            >
              <option value="">{tipoUrbanizacion === "edificios" ? "Todos los edificios" : "Todos los sectores"}</option>
              {sectores.map(s => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
          </div>
        )}
        <input
          type="text"
          className="border rounded px-2 py-1"
          placeholder="Buscar por propietario..."
          value={nombrePersona}
          onChange={e => setNombrePersona(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!urbanizacion && !nombrePersona}
          onClick={async () => {
            setLoading(true);
            let url = `${API_BASE}/unidades.php?`;
            if (urbanizacion) url += `id_urbanizacion=${urbanizacion}&`;
            // Siempre enviar el parámetro de ubicación si hay select visible
            if (ubicacionId) url += `id_sector=${ubicacionId}&`;
            if (nombrePersona) url += `nombre_persona=${encodeURIComponent(nombrePersona)}&`;
            const res = await fetch(url);
            const data = await res.json();
            setUnidades(Array.isArray(data) ? data : []);
            setLoading(false);
          }}
        >Buscar</button>
      </div>

      {/* Tabla de unidades */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded shadow">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-3 py-2 border">Código</th>
              <th className="px-3 py-2 border">Tipo</th>
              <th className="px-3 py-2 border">Propietario</th>
              <th className="px-3 py-2 border">Estado</th>
              <th className="px-3 py-2 border">Situación</th>
              <th className="px-3 py-2 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-4">Cargando...</td></tr>
            ) : unidades.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-4">No hay resultados</td></tr>
            ) : (
              unidades.map(unidad => {
                // Determinar tipo dinámico
                let tipoUnidad = "-";
                if (tipoUrbanizacion === "edificios") {
                  tipoUnidad = "Apartamento";
                } else if (tipoUrbanizacion === "casas") {
                  tipoUnidad = "Casa";
                }
                return (
                  <tr key={unidad.id} className="hover:bg-gray-50">
                    <td className="border px-3 py-2 text-center">{unidad.nombre || unidad.codigo}</td>
                    <td className="border px-3 py-2 text-center">{tipoUnidad}</td>
                    <td className="border px-3 py-2">{unidad.persona ? unidad.persona : "-"}</td>
                    <td className="border px-3 py-2 text-center">
                      <span className={
                        unidad.ocupacion === "alquilado"
                          ? "bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs"
                          : unidad.ocupacion === "deshabitado"
                          ? "bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs"
                          : "bg-green-100 text-green-700 px-2 py-1 rounded text-xs"
                      }>
                        {unidad.ocupacion ? unidad.ocupacion.charAt(0).toUpperCase() + unidad.ocupacion.slice(1) : "-"}
                      </span>
                    </td>
                    <td className="border px-3 py-2 text-center">(pendiente)</td>
                    <td className="border px-3 py-2 text-center">
                      <AccionesUnidad
                        unidad={unidad}
                        onVerDetalles={setModalUnidad}
                        onSituacionFinanciera={setModalSituacion}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modales */}
      <Modal open={!!modalSituacion} onClose={() => setModalSituacion(null)}>
        {modalSituacion && (
          <div>
            <h3 className="text-lg font-bold mb-2">Situación financiera</h3>
            <div className="mb-2">
              <span className="font-semibold">Unidad:</span> {modalSituacion.codigo}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Propietario:</span> {modalSituacion.persona || "-"}
            </div>
            {/* Aquí puedes mostrar el estado de cuenta, pagos, deudas, etc. */}
            <div className="text-gray-500">(Aquí irá el resumen financiero de la unidad)</div>
          </div>
        )}
      </Modal>
      <Modal open={!!modalUnidad} onClose={() => setModalUnidad(null)}>
        {modalUnidad && (
          <div>
            <h3 className="text-lg font-bold mb-2">Detalles de la Unidad</h3>
            <div className="mb-2">
              <span className="font-semibold">Código:</span> {modalUnidad.codigo}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Tipo:</span> {modalUnidad.tipo}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Metros²:</span> {modalUnidad.metros2}
            </div>
            <div className="mb-2">
              <span className="font-semibold">{tipoUrbanizacion === "edificios" ? "Edificio" : "Sector"}:</span> {modalUnidad && modalUnidad.sector ? modalUnidad.sector : "-"}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Urbanización:</span> {modalUnidad.urbanizacion || "-"}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Propietario:</span> {modalUnidad.persona || "-"}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Estado:</span>{" "}
              <span
                className={
                  modalUnidad.estado === "moroso"
                    ? "bg-red-100 text-red-700 px-2 py-1 rounded text-xs"
                    : "bg-green-100 text-green-700 px-2 py-1 rounded text-xs"
                }
              >
                {modalUnidad.estado}
              </span>
            </div>
            {/* Puedes agregar más campos aquí si lo deseas */}
          </div>
        )}
      </Modal>
      <Modal open={!!modalPagoUnidad} onClose={() => setModalPagoUnidad(null)}>
        {modalPagoUnidad && (
          <div>
            <h3 className="text-lg font-bold mb-2">Registrar pago</h3>
            <div className="mb-2">
              <span className="font-semibold">Unidad:</span> {modalPagoUnidad.codigo}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Propietario:</span> {modalPagoUnidad.persona || "-"}
            </div>
            {/* Aquí irá el formulario de pago */}
            <div className="text-gray-500">(Aquí irá el formulario para registrar el pago)</div>
          </div>
        )}
      </Modal>
    </>
  );
}

export default Propietarios;
