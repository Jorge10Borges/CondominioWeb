import React from "react";

function DetalleModal({ open, onClose, onSave, initialData, loading, reciboId }) {
  const [concepto, setConcepto] = React.useState(initialData?.concepto || "");
  const [descripcion, setDescripcion] = React.useState(initialData?.descripcion || "");
  const [monto, setMonto] = React.useState(initialData?.monto || "");

  React.useEffect(() => {
    setConcepto(initialData?.concepto || "");
    setDescripcion(initialData?.descripcion || "");
    setMonto(initialData?.monto || "");
  }, [initialData, open]);

  const handleSubmit = e => {
    e.preventDefault();
    if (!concepto.trim() || !descripcion.trim() || !monto || isNaN(monto)) return;
    onSave({ concepto, descripcion, monto });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
          onClick={onClose}
          type="button"
        >×</button>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">{initialData ? 'Editar detalle' : 'Agregar detalle'}</h3>
          {typeof reciboId !== 'undefined' && reciboId !== null && (
            <span className="text-base font-semibold text-gray-600">ID #{reciboId.toString().padStart(5, '0')}</span>
          )}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block text-sm font-semibold mb-1">Concepto</label>
            <input
              type="text"
              className="border rounded px-2 py-1 w-full"
              value={concepto}
              onChange={e => setConcepto(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-semibold mb-1">Descripción</label>
            <input
              type="text"
              className="border rounded px-2 py-1 w-full"
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1">Monto</label>
            <input
              type="number"
              className="border rounded px-2 py-1 w-full"
              value={monto}
              min="0"
              step="0.01"
              onChange={e => setMonto(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
            className="bg-gray-200 px-4 py-1 rounded hover:bg-gray-300 cursor-pointer"
              onClick={onClose}
              disabled={loading}
            >Cancelar</button>
            <button
              type="submit"
            className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 cursor-pointer"
              disabled={loading}
            >{loading ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DetalleModal;
