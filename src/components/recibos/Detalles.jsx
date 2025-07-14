

import React, { useState } from "react";
import DetalleModal from "./DetalleModal";
import ConfirmModal from "./ConfirmModal";
const API_BASE = import.meta.env.VITE_API_BASE_URL;


function Detalles({ reciboId, onVolver }) {
  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEditIdx, setModalEditIdx] = useState(null); // null: agregar, number: editar
  // Para confirmación de eliminación
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteIdx, setDeleteIdx] = useState(null);


  // Cargar detalles existentes al montar o cuando cambia reciboId
  React.useEffect(() => {
    if (!reciboId) return;
    fetch(`${API_BASE}/recibo_detalle.php?reciboId=${reciboId}`)
      .then(res => res.json())
      .then(data => setDetalles(Array.isArray(data.detalles) ? data.detalles : []))
      .catch(() => setDetalles([]));
  }, [reciboId]);


  // Abrir modal para agregar
  const handleOpenAgregar = () => {
    setModalEditIdx(null);
    setModalOpen(true);
  };

  // Abrir modal para editar
  const handleOpenEditar = (idx) => {
    setModalEditIdx(idx);
    setModalOpen(true);
  };

  // Guardar detalle (agregar o editar)
  const handleSaveDetalle = async (detalle) => {
    setLoading(true);
    if (modalEditIdx === null) {
      // Agregar
      try {
        const res = await fetch(`${API_BASE}/recibo_detalle.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reciboId,
            concepto: detalle.concepto,
            descripcion: detalle.descripcion,
            monto: detalle.monto.toString()
          })
        });
        const data = await res.json();
        if (data.success && data.detalle) {
          setDetalles([...detalles, data.detalle]);
          if (window.toast) window.toast.success('Información guardada correctamente');
        } else {
          alert(data.error || 'No se pudo agregar el detalle');
        }
      } catch (err) {
        alert('Error de red o servidor');
      }
    } else {
      // Editar en backend
      try {
        const detalleEdit = detalles[modalEditIdx];
        const res = await fetch(`${API_BASE}/recibo_detalle.php`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: detalleEdit.id,
            concepto: detalle.concepto,
            descripcion: detalle.descripcion,
            monto: detalle.monto
          })
        });
        const data = await res.json();
        if (data.success) {
          const nuevos = [...detalles];
          nuevos[modalEditIdx] = {
            ...nuevos[modalEditIdx],
            concepto: detalle.concepto,
            descripcion: detalle.descripcion,
            monto: detalle.monto
          };
          setDetalles(nuevos);
          if (window.toast) window.toast.success('Información modificada correctamente');
        } else {
          alert(data.error || 'No se pudo editar el detalle');
        }
      } catch (err) {
        alert('Error de red o servidor');
      }
    }
    setLoading(false);
    setModalOpen(false);
  };

  // Mostrar modal de confirmación
  const handleEliminar = idx => {
    setDeleteIdx(idx);
    setConfirmOpen(true);
  };

  // Confirmar eliminación
  const handleConfirmEliminar = async () => {
    if (deleteIdx === null) return;
    const idx = deleteIdx;
    const detalle = detalles[idx];
    setLoading(true);
    if (!detalle.id) {
      setDetalles(detalles.filter((_, i) => i !== idx));
      setLoading(false);
      setConfirmOpen(false);
      setDeleteIdx(null);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/recibo_detalle.php?id=${detalle.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setDetalles(detalles.filter((_, i) => i !== idx));
        if (window.toast) window.toast.success('Detalle eliminado correctamente');
      } else {
        alert(data.error || 'No se pudo eliminar el detalle');
      }
    } catch (err) {
      alert('Error de red o servidor');
    }
    setLoading(false);
    setConfirmOpen(false);
    setDeleteIdx(null);
  };



  return (
    <div className="p-4">
      <button
        className="mb-4 bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded cursor-pointer"
        onClick={onVolver}
      >
        ← Volver
      </button>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Detalles del Recibo</h2>
        <h2 className="text-xl font-semibold text-gray-600">Recibo #{reciboId ? reciboId.toString().padStart(5, '0') : ''}</h2>
      </div>
      <div className="mb-6">
        <button
          className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 cursor-pointer"
          onClick={handleOpenAgregar}
        >Agregar detalle</button>
      </div>
      <DetalleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveDetalle}
        initialData={modalEditIdx !== null ? detalles[modalEditIdx] : null}
        loading={loading}
        reciboId={reciboId}
      />
      <ConfirmModal
        open={confirmOpen}
        title="Eliminar detalle"
        message="¿Seguro que deseas eliminar este detalle? Esta acción no se puede deshacer."
        onConfirm={handleConfirmEliminar}
        onCancel={() => { setConfirmOpen(false); setDeleteIdx(null); }}
        loading={loading}
      />
      {/* Tabla de detalles agregados */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded shadow">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-1 py-2 border-b text-left w-1 whitespace-nowrap">Concepto</th>
              <th className="px-4 py-2 border-b text-left">Descripción</th>
              <th className="px-1 py-2 border-b text-right w-1 whitespace-nowrap">Monto</th>
              <th className="px-2 py-2 border-b text-left w-1 whitespace-nowrap">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {detalles.length > 0 ? (
              detalles.map((d, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b">{d.concepto}</td>
                  <td className="px-4 py-2 border-b">{d.descripcion}</td>
                  <td className="px-4 py-2 border-b text-right">{Number(d.monto).toLocaleString('es-VE', { style: 'currency', currency: 'VES' })}</td>
                  <td className="px-4 py-2 border-b">
                    <button
                      className="mr-2 cursor-pointer group"
                      title="Editar"
                      onClick={() => handleOpenEditar(idx)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline w-5 h-5 align-middle cursor-pointer text-blue-500 group-hover:text-blue-700 transition-colors"><path d="M14.3601 4.07866L15.2869 3.15178C16.8226 1.61607 19.3125 1.61607 20.8482 3.15178C22.3839 4.68748 22.3839 7.17735 20.8482 8.71306L19.9213 9.63993M14.3601 4.07866C14.3601 4.07866 14.4759 6.04828 16.2138 7.78618C17.9517 9.52407 19.9213 9.63993 19.9213 9.63993M14.3601 4.07866L12 6.43872M19.9213 9.63993L14.6607 14.9006L11.5613 18L11.4001 18.1612C10.8229 18.7383 10.5344 19.0269 10.2162 19.2751C9.84082 19.5679 9.43469 19.8189 9.00498 20.0237C8.6407 20.1973 8.25352 20.3263 7.47918 20.5844L4.19792 21.6782M4.19792 21.6782L3.39584 21.9456C3.01478 22.0726 2.59466 21.9734 2.31063 21.6894C2.0266 21.4053 1.92743 20.9852 2.05445 20.6042L2.32181 19.8021M4.19792 21.6782L2.32181 19.8021M2.32181 19.8021L3.41556 16.5208C3.67368 15.7465 3.80273 15.3593 3.97634 14.995C4.18114 14.5653 4.43213 14.1592 4.7249 13.7838C4.97308 13.4656 5.26166 13.1771 5.83882 12.5999L8.5 9.93872" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                    </button>
                    <button
                      title="Eliminar"
                      onClick={() => handleEliminar(idx)}
                      className="cursor-pointer group"
                    >
                      <svg className="inline text-red-500 hover:text-red-700 h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.5001 6H3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path><path d="M9.5 11L10 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path><path d="M14.5 11L14 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path><path d="M6.5 6C6.55588 6 6.58382 6 6.60915 5.99936C7.43259 5.97849 8.15902 5.45491 8.43922 4.68032C8.44784 4.65649 8.45667 4.62999 8.47434 4.57697L8.57143 4.28571C8.65431 4.03708 8.69575 3.91276 8.75071 3.8072C8.97001 3.38607 9.37574 3.09364 9.84461 3.01877C9.96213 3 10.0932 3 10.3553 3H13.6447C13.9068 3 14.0379 3 14.1554 3.01877C14.6243 3.09364 15.03 3.38607 15.2493 3.8072C15.3043 3.91276 15.3457 4.03708 15.4286 4.28571L15.5257 4.57697C15.5433 4.62992 15.5522 4.65651 15.5608 4.68032C15.841 5.45491 16.5674 5.97849 17.3909 5.99936C17.4162 6 17.4441 6 17.5 6" stroke="currentColor" strokeWidth="1.5"></path><path d="M18.3735 15.3991C18.1965 18.054 18.108 19.3815 17.243 20.1907C16.378 21 15.0476 21 12.3868 21H11.6134C8.9526 21 7.6222 21 6.75719 20.1907C5.89218 19.3815 5.80368 18.054 5.62669 15.3991L5.16675 8.5M18.8334 8.5L18.6334 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-2 border-b text-center text-gray-400" colSpan={4}>
                  No hay detalles agregados
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-bold">
              <td className="px-4 py-2 border-t text-right" colSpan={2}>Total</td>
              <td className="px-4 py-2 border-t text-right">
                {detalles.reduce((acc, d) => acc + Number(d.monto), 0).toLocaleString('es-VE', { style: 'currency', currency: 'VES' })}
              </td>
              <td className="px-4 py-2 border-t"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
export default Detalles;
