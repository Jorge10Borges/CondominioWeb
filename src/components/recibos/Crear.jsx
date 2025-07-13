import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function Crear() {
  // Estados para filtros y selección
  const [juntas, setJuntas] = useState([]);
  const [juntaId, setJuntaId] = useState("");
  const [modoRecibo, setModoRecibo] = useState("mensual"); // 'mensual' o 'especial'
  const [tipoRecibo, setTipoRecibo] = useState("mensual");
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
  // Estado para mostrar detalles y ocultar Crear
  const [reciboDetalles, setReciboDetalles] = useState(null);
  // Cargar tipos de recibo especial al montar
  useEffect(() => {
    fetch(`${API_BASE}/tipos_recibo_especial.php`)
      .then(res => res.json())
      .then(data => setTiposReciboEspecial(Array.isArray(data) ? data : []))
      .catch(() => setTiposReciboEspecial([]));
  }, []);

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
  const handleCrearRecibosMasivos = async () => {
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
          sectorId: sectorId || null
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Recibo mensual creado correctamente.');
      } else {
        toast.error(data.error || 'Error al crear recibos.');
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
          sectorId: sectorId || null
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Recibo especial creado correctamente.');
      } else {
        toast.error(data.error || 'Error al crear recibo especial.');
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

  return (
    <div className="p-4">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      <h2 className="text-xl font-bold mb-4">Crear recibo</h2>
      {/* Selector de junta de condominio y tipo de gestión */}
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div>
          <label className="block text-sm font-semibold mb-1">Junta de condominio</label>
          <select
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
            <label className="block text-sm font-semibold mb-1">Tipo de gestión</label>
            <select
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
                <label className="block text-sm font-semibold mb-1">Mes</label>
                <select
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
                <label className="block text-sm font-semibold mb-1">Año</label>
                <input
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
                      className="bg-green-600 text-white ms-2 px-4 py-1 rounded hover:bg-green-700"
                      disabled={!puedeCrearMensual}
                      onClick={handleCrearRecibosMasivos}
                    >{loading ? "Creando..." : "Crear recibo mensual"}</button>
                  </div>
                </div>
              )}
              {/* Si no hay sectores, mostrar el botón aparte */}
              {(!sectores.length || !tipoUbicacion) && (
                <div className="mt-6">
                  <button
                    className="bg-green-600 text-white ms-2 px-4 py-1 rounded hover:bg-green-700"
                    disabled={!puedeCrearMensual}
                    onClick={handleCrearRecibosMasivos}
                  >{loading ? "Creando..." : "Crear recibo mensual"}</button>
                </div>
              )}
            </>
          )}
          {modoRecibo === "especial" && (
            <>
              <div>
                <label className="block text-sm font-semibold mb-1">Tipo de recibo especial</label>
                <select
                  className="border rounded px-2 py-1"
                  value={tipoRecibo}
                  onChange={e => setTipoRecibo(e.target.value)}
                >
                  <option value="">Seleccione un tipo</option>
                  {tiposReciboEspecial.map(tipo => (
                    <option key={tipo.id} value={tipo.nombre.toLowerCase()}>{tipo.nombre}</option>
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
                      className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
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
                </div>
              )}
              {/* Si no hay sectores, mostrar el botón aparte */}
              {(!sectores.length || !tipoUbicacion) && (
                <div className="mt-6">
                  <button
                    className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
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
      {/* Aquí irá la tabla de recibos generados */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Recibos generados</h2>
        {/* Aquí irá la tabla de recibos generados */}
        {/* Tabla de recibos (por implementar) */}
        <div className="text-gray-500">(Aquí irá la tabla de recibos generados)</div>
      </div>
    </div>
  );
}

export default Crear;
