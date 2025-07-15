
import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Detalles from "./Detalles";
import ConfirmModal from "./ConfirmModal";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function Crear() {
  // Estados para filtros y selección
  const [juntas, setJuntas] = useState([]);
  const [juntaId, setJuntaId] = useState("");
  const [modoRecibo, setModoRecibo] = useState("mensual"); // 'mensual' o 'especial'
  // tipoRecibo almacena el id del tipo especial seleccionado
  const [tipoRecibo, setTipoRecibo] = useState("");
  const now = new Date();
  const [mes, setMes] = useState(String(now.getMonth() + 1));
  const [anio, setAnio] = useState(String(now.getFullYear()));
  const [unidades, setUnidades] = useState([]); // Para recibos individuales
  const [loading, setLoading] = useState(false);
  const [sectores, setSectores] = useState([]);
  const [sectorId, setSectorId] = useState("");
  const [tipoUbicacion, setTipoUbicacion] = useState(""); // 'sector' o 'apartamento'
  // Tipos de recibo especial
  const [tiposReciboEspecial, setTiposReciboEspecial] = useState([]);
  // Estado para alternar entre Crear y Detalles
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  // Estado para el id del recibo creado
  const [reciboId, setReciboId] = useState(null);
  // Estado para recibos en preparación
  const [recibosPreparacion, setRecibosPreparacion] = useState([]);

  // Confirmación para eliminar recibo
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Mostrar modal de confirmación
  const handleEliminarRecibo = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  // Confirmar eliminación
  const handleConfirmEliminar = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`${API_BASE}/recibos.php?id=${deleteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setRecibosPreparacion(recibosPreparacion.filter(r => r.id !== deleteId));
        toast.success('Recibo eliminado');
      } else {
        toast.error(data.error || 'No se pudo eliminar');
      }
    } catch {
      toast.error('Error de red o servidor');
    }
    setDeleteLoading(false);
    setConfirmOpen(false);
    setDeleteId(null);
  };

  // Editar recibo en preparación: mostrar Detalles para ese recibo
  const handleEditarRecibo = (id) => {
    setReciboId(id);
    setMostrarDetalles(true);
  };
  // Cargar tipos de recibo especial al montar
  useEffect(() => {
    fetch(`${API_BASE}/tipos_recibo_especial.php`)
      .then(res => res.json())
      .then(data => setTiposReciboEspecial(Array.isArray(data) ? data : []))
      .catch(() => setTiposReciboEspecial([]));
  }, []);

  // Cargar recibos en preparación (editable=true) de la junta seleccionada
  useEffect(() => {
    if (!juntaId) {
      setRecibosPreparacion([]);
      return;
    }
    fetch(`${API_BASE}/recibos.php?editable=1&juntaIds=${juntaId}`)
      .then(res => res.json())
      .then(data => setRecibosPreparacion(Array.isArray(data) ? data : []))
      .catch(() => setRecibosPreparacion([]));
  }, [juntaId]);

  // Cargar juntas de condominio al montar
  useEffect(() => {
    fetch(`${API_BASE}/juntas_condominio.php`)
      .then(res => res.json())
      .then(data => setJuntas(Array.isArray(data) ? data : []))
      .catch(() => setJuntas([]));
  }, []);

  // Cargar sectores/apartamentos según la junta seleccionada
  useEffect(() => {
    if (!juntaId) {
      setSectores([]);
      setSectorId("");
      setTipoUbicacion("");
      return;
    }
    // Buscar la junta seleccionada
    const junta = juntas.find(j => String(j.id) === String(juntaId));
    if (!junta) {
      setSectores([]);
      setSectorId("");
      setTipoUbicacion("");
      return;
    }
    // Obtener id_urbanizacion y buscar tipo
    fetch(`${API_BASE}/urbanizaciones.php?id=${junta.id_urbanizacion}`)
      .then(res => res.json())
      .then(urb => {
        if (!urb || !urb.tipo) {
          setTipoUbicacion("");
          setSectores([]);
          setSectorId("");
          return;
        }
        // Determinar si es sector o edificio
        const tipo = urb.tipo.toLowerCase().includes("edificio") ? "edificio" : "sector";
        setTipoUbicacion(tipo);
        // Cargar sectores/apartamentos
        fetch(`${API_BASE}/sectores.php?id_urbanizacion=${junta.id_urbanizacion}`)
          .then(res2 => res2.json())
          .then(data => setSectores(Array.isArray(data) ? data : []))
          .catch(() => setSectores([]));
      })
      .catch(() => {
        setTipoUbicacion("");
        setSectores([]);
        setSectorId("");
      });
  }, [juntaId, juntas]);


  // Handler para crear recibos masivos
  const handleCrearRecibos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/recibos.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          juntaId,
          tipo: 'mensual',
          mes,
          anio,
          sectorId: sectorId || null,
          editable: true
        })
      });
      const data = await res.json();
      if (data.success && data.id) {
        setReciboId(data.id);
        setMostrarDetalles(true);
      } else {
        toast.error(data.error || 'Error al crear recibo.');
      }
    } catch (e) {
      toast.error('Error de red o del servidor.');
    }
    setLoading(false);
  };

  // Handler para crear recibo individual (especial)
  const handleCrearReciboIndividual = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/recibos.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          juntaId,
          tipo: 'especial',
          tipoReciboEspecial: tipoRecibo,
          sectorId: sectorId || null,
          editable: true
        })
      });
      const data = await res.json();
      if (data.success && data.id) {
        setReciboId(data.id);
        setMostrarDetalles(true);
      } else {
        toast.error(data.error || 'Error al crear recibo especial.');
      }
    } catch (e) {
      toast.error('Error de red o del servidor.');
    }
    setLoading(false);
  };

  // Guardar recibo y detalles en la base de datos
  const handleGuardarRecibo = async (detalles) => {
    setLoading(true);
    try {
      let body = {
        juntaId,
        tipo: modoRecibo,
        detalles,
        sectorId: sectorId || null
      };
      if (modoRecibo === 'mensual') {
        body.mes = mes;
        body.anio = anio;
      } else {
        body.tipoReciboEspecial = tipoRecibo;
      }
      const res = await fetch(`${API_BASE}/recibos.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Recibo guardado correctamente.');
        setMostrarDetalles(false);
        setDetallesRecibo([]);
      } else {
        toast.error(data.error || 'Error al guardar recibo.');
      }
    } catch (e) {
      toast.error('Error de red o del servidor.');
    }
    setLoading(false);
  };

  // Validar que la junta seleccionada sea válida
  const isJuntaValida = juntaId && juntas.some(j => String(j.id) === String(juntaId));

  // Validar que el sector/edificio sea requerido y válido si hay sectores disponibles
  const isSectorRequerido = sectores.length > 0 && tipoUbicacion;
  const isSectorValido = !isSectorRequerido || (sectorId && sectores.some(s => String(s.id) === String(sectorId)));

  // Validar inputs para habilitar el botón según el modo
  const puedeCrearMensual = isJuntaValida && mes && anio && isSectorValido && !loading;
  const puedeCrearEspecial = isJuntaValida && tipoRecibo && isSectorValido && !loading;

if (mostrarDetalles && reciboId) {
  return <Detalles reciboId={reciboId} onVolver={() => {
    setMostrarDetalles(false);
    setReciboId(null);
    // Recargar recibos en preparación al volver de Detalles
    if (juntaId) {
      fetch(`${API_BASE}/recibos.php?editable=1&juntaIds=${juntaId}`)
        .then(res => res.json())
        .then(data => setRecibosPreparacion(Array.isArray(data) ? data : []))
        .catch(() => setRecibosPreparacion([]));
    }
  }} onGuardar={handleGuardarRecibo} loading={loading} />;
}
  return (
    <div className="px-2 md:px-4 py-4">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      <h2 className="text-xl font-bold mb-4">Crear recibo</h2>
      {/* Selector de junta de condominio y tipo de gestión */}
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
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label htmlFor="modoRecibo" className="block text-sm font-semibold mb-1">Tipo de gestión</label>
            <select
              id="modoRecibo"
              className="border rounded px-2 py-1 w-64"
              value={modoRecibo}
              onChange={e => {
                setModoRecibo(e.target.value);
                setTipoRecibo(e.target.value === 'mensual' ? 'mensual' : 'multa');
                setUnidades([]);
              }}
            >
              <option value="mensual">Recibos mensuales</option>
              <option value="especial">Recibos especiales</option>
            </select>
          </div>
          {modoRecibo === "mensual" && (
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
              {/* Select de sector/edificio y botón en la misma fila */}
              {sectores.length > 0 && tipoUbicacion && (
                <div className="flex gap-2 items-end flex-wrap">
                  <div>
                    <label htmlFor="sectorId" className="block text-sm font-semibold mb-1">
                      {tipoUbicacion === 'sector' ? 'Sector' : 'Edificio'}
                    </label>
                    <select
                      id="sectorId"
                      className="border rounded px-2 py-1 w-56"
                      value={sectorId}
                      onChange={e => setSectorId(e.target.value)}
                    >
                      <option value="">Seleccione {tipoUbicacion === 'sector' ? 'un sector' : 'un edificio'}</option>
                      {sectores.map(s => (
                        <option key={s.id} value={s.id}>{s.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mt-6">
                    <button
                      className="bg-green-600 text-white ms-2 px-4 py-1 rounded hover:bg-green-700 cursor-pointer"
                      disabled={!puedeCrearMensual}
                      onClick={handleCrearRecibos}
                    >{loading ? "Creando..." : "Crear recibo mensual"}</button>
                  </div>
                </div>
              )}
              {/* Si no hay sectores, mostrar el botón aparte */}
              {(!sectores.length || !tipoUbicacion) && (
                <div className="mt-6">
                  <button
                    className="bg-green-600 text-white ms-2 px-4 py-1 rounded hover:bg-green-700 cursor-pointer"
                    disabled={!puedeCrearMensual}
                    onClick={handleCrearRecibos}
                  >{loading ? "Creando..." : "Crear recibo mensual"}</button>
                </div>
              )}
            </>
          )}
          {modoRecibo === "especial" && (
            <>
              <div>
                <label htmlFor="tipoRecibo" className="block text-sm font-semibold mb-1">Tipo de recibo especial</label>
                <select
                  id="tipoRecibo"
                  className="border rounded px-2 py-1"
                  value={tipoRecibo}
                  onChange={e => setTipoRecibo(e.target.value)}
                >
                  <option value="">Seleccione un tipo</option>
                  {tiposReciboEspecial.map(tipo => (
                    <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                  ))}
                </select>
              </div>
              {/* Select de sector/edificio y botón en la misma fila */}
              {sectores.length > 0 && tipoUbicacion && (
                <div className="flex gap-2 items-end flex-wrap">
                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      {tipoUbicacion === 'sector' ? 'Sector' : 'Edificio'}
                    </label>
                    <select
                      className="border rounded px-2 py-1 w-56"
                      value={sectorId}
                      onChange={e => setSectorId(e.target.value)}
                    >
                      <option value="">Seleccione {tipoUbicacion === 'sector' ? 'un sector' : 'un edificio'}</option>
                      {sectores.map(s => (
                        <option key={s.id} value={s.id}>{s.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mt-6">
                    <button
                      className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 cursor-pointer"
                      disabled={!puedeCrearEspecial}
                      onClick={handleCrearReciboIndividual}
                    >
                      {loading
                        ? `Creando...`
                        : (() => {
                            const tipoObj = tiposReciboEspecial.find(t => String(t.id) === String(tipoRecibo));
                            return `Crear recibo de ${tipoObj ? tipoObj.nombre : ''}`;
                          })()}
                    </button>
                  </div>
                </div>
              )}
              {/* Si no hay sectores, mostrar el botón aparte */}
              {(!sectores.length || !tipoUbicacion) && (
                <div className="mt-6">
                  <button
                    className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 cursor-pointer"
                    disabled={!puedeCrearEspecial}
                    onClick={handleCrearReciboIndividual}
                  >
                    {loading
                      ? `Creando...`
                      : `Crear recibo de ${
                          tipoRecibo === 'multa' ? 'Multa' : tipoRecibo === 'daño' ? 'Daño' : tipoRecibo === 'extraordinario' ? 'Extraordinario' : ''
                        }`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Tabla de recibos generados en preparación */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Recibos generados en preparación</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-1 py-1 w-1 whitespace-nowrap">ID</th>
                <th className="border px-2 py-1">Junta</th>
                <th className="border px-1 py-1 w-1 whitespace-nowrap">Mes</th>
                <th className="border px-1 py-1 w-1 whitespace-nowrap">Año</th>
                <th className="border px-1 py-1 w-1 whitespace-nowrap">Tipo</th>
                <th className="border px-2 py-1 w-1 whitespace-nowrap text-right">Total</th>
                <th className="border px-1 py-1 w-1 whitespace-nowrap">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {recibosPreparacion.length === 0 ? (
                <tr>
                  <td className="border px-2 py-1 text-center text-gray-400" colSpan={6}>
                    No hay recibos en preparación
                  </td>
                </tr>
              ) : (
                recibosPreparacion.map(r => {
                  // Buscar nombre de la junta
                  const junta = juntas.find(j => String(j.id) === String(r.id_junta));
                  // Mostrar nombre de tipo especial si aplica
                  // Nueva lógica para mostrar el tipo correctamente
                  let tipoLabel = '';
                  const idTipo = r.id_tipo_recibo || r.tipoReciboEspecial || r.tipo_recibo_especial;
                  if (idTipo === 0 || idTipo === '0' || idTipo === null || idTipo === undefined) {
                    tipoLabel = 'Mensual';
                  } else if (Number(idTipo) > 0 && tiposReciboEspecial.length > 0) {
                    const tipoObj = tiposReciboEspecial.find(t => String(t.id) === String(idTipo));
                    tipoLabel = tipoObj ? tipoObj.nombre : 'Especial';
                  } else {
                    tipoLabel = 'Especial';
                  }
                  return (
                    <tr key={r.id}>
                      <td className="border px-2 py-1">{String(r.id).padStart(5, '0')}</td>
                      <td className="border px-2 py-1">{junta ? junta.nombre : r.id_junta}</td>
                      <td className="border px-2 py-1">{r.mes}</td>
                      <td className="border px-2 py-1">{r.anio}</td>
                      <td className="border px-2 py-1">{tipoLabel}</td>
                      <td className="border px-2 py-1 text-right">
                        {Number(r.total_recibo || 0).toLocaleString('es-VE', { style: 'currency', currency: 'VES' })}
                      </td>
                      <td className="border px-2 py-1">
                        <button
                          className="mr-2 cursor-pointer group"
                          title="Editar"
                          onClick={() => handleEditarRecibo(r.id)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline w-5 h-5 align-middle cursor-pointer text-blue-500 group-hover:text-blue-700 transition-colors">
                            <path d="M14.3601 4.07866L15.2869 3.15178C16.8226 1.61607 19.3125 1.61607 20.8482 3.15178C22.3839 4.68748 22.3839 7.17735 20.8482 8.71306L19.9213 9.63993M14.3601 4.07866C14.3601 4.07866 14.4759 6.04828 16.2138 7.78618C17.9517 9.52407 19.9213 9.63993 19.9213 9.63993M14.3601 4.07866L12 6.43872M19.9213 9.63993L14.6607 14.9006L11.5613 18L11.4001 18.1612C10.8229 18.7383 10.5344 19.0269 10.2162 19.2751C9.84082 19.5679 9.43469 19.8189 9.00498 20.0237C8.6407 20.1973 8.25352 20.3263 7.47918 20.5844L4.19792 21.6782M4.19792 21.6782L3.39584 21.9456C3.01478 22.0726 2.59466 21.9734 2.31063 21.6894C2.0266 21.4053 1.92743 20.9852 2.05445 20.6042L2.32181 19.8021M4.19792 21.6782L2.32181 19.8021M2.32181 19.8021L3.41556 16.5208C3.67368 15.7465 3.80273 15.3593 3.97634 14.995C4.18114 14.5653 4.43213 14.1592 4.7249 13.7838C4.97308 13.4656 5.26166 13.1771 5.83882 12.5999L8.5 9.93872" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </button>
                        <button
                          title="Eliminar"
                          onClick={() => handleEliminarRecibo(r.id)}
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
      <ConfirmModal
        open={confirmOpen}
        title="Eliminar recibo"
        message="¿Seguro que deseas eliminar este recibo? Esta acción no se puede deshacer."
        onConfirm={handleConfirmEliminar}
        onCancel={() => { setConfirmOpen(false); setDeleteId(null); }}
        loading={deleteLoading}
      />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default Crear;
