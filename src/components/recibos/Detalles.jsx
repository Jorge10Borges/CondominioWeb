import React, { useState } from "react";

function Detalles() {
  const [concepto, setConcepto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [detalles, setDetalles] = useState([]);

  const handleAgregar = () => {
    if (!concepto.trim() || !descripcion.trim() || !monto || isNaN(monto)) return;
    setDetalles([
      ...detalles,
      { concepto, descripcion, monto: parseFloat(monto) }
    ]);
    setConcepto("");
    setDescripcion("");
    setMonto("");
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Detalles del Recibo</h2>
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div>
          <label className="block text-sm font-semibold mb-1">Concepto</label>
          <input
            type="text"
            className="border rounded px-2 py-1 w-56"
            placeholder="Concepto"
            value={concepto}
            onChange={e => setConcepto(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Descripción</label>
          <input
            type="text"
            className="border rounded px-2 py-1 w-64"
            placeholder="Descripción"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Monto</label>
          <input
            type="number"
            className="border rounded px-2 py-1 w-24"
            placeholder="Monto"
            value={monto}
            min="0"
            step="0.01"
            onChange={e => setMonto(e.target.value)}
          />
        </div>
        <div className="mt-6">
          <button
            className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
            onClick={handleAgregar}
          >Agregar</button>
        </div>
      </div>
      {/* Tabla de detalles agregados */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded shadow">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border-b text-left">Concepto</th>
              <th className="px-4 py-2 border-b text-left">Descripción</th>
              <th className="px-4 py-2 border-b text-left">Monto</th>
              <th className="px-4 py-2 border-b text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {detalles.length > 0 ? (
              detalles.map((d, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b">{d.concepto}</td>
                  <td className="px-4 py-2 border-b">{d.descripcion}</td>
                  <td className="px-4 py-2 border-b">{Number(d.monto).toLocaleString('es-VE', { style: 'currency', currency: 'VES' })}</td>
                  <td className="px-4 py-2 border-b">
                    <button
                      className="text-blue-600 hover:underline mr-2"
                      onClick={() => {/* lógica de editar pendiente */}}
                    >
                      <svg viewBox="0 0 24 24" className="inline-1 h-5 w-5 cursor-pointer" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M14.3601 4.07866L15.2869 3.15178C16.8226 1.61607 19.3125 1.61607 20.8482 3.15178C22.3839 4.68748 22.3839 7.17735 20.8482 8.71306L19.9213 9.63993M14.3601 4.07866C14.3601 4.07866 14.4759 6.04828 16.2138 7.78618C17.9517 9.52407 19.9213 9.63993 19.9213 9.63993M14.3601 4.07866L12 6.43872M19.9213 9.63993L14.6607 14.9006L11.5613 18L11.4001 18.1612C10.8229 18.7383 10.5344 19.0269 10.2162 19.2751C9.84082 19.5679 9.43469 19.8189 9.00498 20.0237C8.6407 20.1973 8.25352 20.3263 7.47918 20.5844L4.19792 21.6782M4.19792 21.6782L3.39584 21.9456C3.01478 22.0726 2.59466 21.9734 2.31063 21.6894C2.0266 21.4053 1.92743 20.9852 2.05445 20.6042L2.32181 19.8021M4.19792 21.6782L2.32181 19.8021M2.32181 19.8021L3.41556 16.5208C3.67368 15.7465 3.80273 15.3593 3.97634 14.995C4.18114 14.5653 4.43213 14.1592 4.7249 13.7838C4.97308 13.4656 5.26166 13.1771 5.83882 12.5999L8.5 9.93872" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path> </g></svg>
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => setDetalles(detalles.filter((_, i) => i !== idx))}
                    >
                      <svg viewBox="0 0 24 24" className="inline-1 h5 w-5 cursor-pointer" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M9.17065 4C9.58249 2.83481 10.6937 2 11.9999 2C13.3062 2 14.4174 2.83481 14.8292 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path> <path d="M20.5 6H3.49988" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path> <path d="M18.3735 15.3991C18.1965 18.054 18.108 19.3815 17.243 20.1907C16.378 21 15.0476 21 12.3868 21H11.6134C8.9526 21 7.6222 21 6.75719 20.1907C5.89218 19.3815 5.80368 18.054 5.62669 15.3991L5.16675 8.5M18.8334 8.5L18.6334 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path> <path d="M9.5 11L10 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path> <path d="M14.5 11L14 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path> </g></svg>
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
              <td className="px-4 py-2 border-t">
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
