import React from "react";

function ConfirmModal({ open, title = "Confirmar acción", message, onConfirm, onCancel, loading = false }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xs p-6 animate-fade-in">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">{title}</h3>
        <p className="mb-6 text-gray-600">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium cursor-pointer"
            onClick={onCancel}
            disabled={loading}
          >Cancelar</button>
          <button
            className="px-4 py-1 rounded bg-red-600 hover:bg-red-700 text-white font-medium cursor-pointer"
            onClick={onConfirm}
            disabled={loading}
          >{loading ? 'Eliminando...' : 'Confirmar'}</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
