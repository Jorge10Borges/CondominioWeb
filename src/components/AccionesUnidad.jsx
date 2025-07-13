import React from "react";

function AccionesUnidad({ unidad, onVerDetalles, onRegistrarPago, onSituacionFinanciera }) {
  return (
    <>
      {/* Botón Ver detalles */}
      <button
        title="Ver detalles"
        className="mx-1 text-blue-600 hover:text-blue-800 cursor-pointer"
        onClick={() => onVerDetalles(unidad)}
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline w-5 h-5">
          <g id="SVGRepo_iconCarrier">
            <path d="M22 15C22 18.7712 22 19.6569 20.8284 20.8284C19.6569 22 17.7712 22 14 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
            <path d="M10 2C6.22876 2 4.34315 2 3.17157 3.17157C2 4.34315 2 5.22876 2 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
            <path d="M12 7C9.07268 7 7.08037 8.56222 5.89242 9.94021C5.29747 10.6303 5 10.9754 5 12C5 13.0246 5.29748 13.3697 5.89243 14.0598C7.08038 15.4378 9.07268 17 12 17C14.9273 17 16.9196 15.4378 18.1076 14.0598C18.7025 13.3697 19 13.0246 19 12C19 10.9754 18.7025 10.6303 18.1076 9.94021C17.5723 9.31933 16.8738 8.66106 16 8.12513" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
            <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.5"></circle>
            <path d="M10 22C9.65081 22 9.31779 22 9 21.9991M2 15C2 18.7712 2 19.6569 3.17157 20.8284C3.82475 21.4816 4.69989 21.7706 6 21.8985" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
            <path d="M14 2C14.3492 2 14.6822 2 15 2.00093M22 9C22 5.22876 22 4.34315 22 3.17157C20.1752 2.51839 19.3001 2.22937 18 2.10149" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
          </g>
        </svg>
      </button>
      {/* Botón Situación financiera */}
      <button
        title="Situación financiera"
        className="mx-1 text-yellow-600 hover:text-yellow-800 cursor-pointer"
        onClick={() => onSituacionFinanciera(unidad)}
      >
        <svg viewBox="0 0 24 24" className="inline w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g id="SVGRepo_iconCarrier">
            <path d="M19.8978 16H7.89778C6.96781 16 6.50282 16 6.12132 16.1022C5.08604 16.3796 4.2774 17.1883 4 18.2235" stroke="currentColor" strokeWidth="1.5"></path>
            <path d="M8 7H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
            <path d="M8 10.5H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
            <path d="M13 16V19.5309C13 19.8065 13 19.9443 12.9051 20C12.8103 20.0557 12.6806 19.9941 12.4211 19.8708L11.1789 19.2808C11.0911 19.2391 11.0472 19.2182 11 19.2182C10.9528 19.2182 10.9089 19.2391 10.8211 19.2808L9.57889 19.8708C9.31943 19.9941 9.18971 20.0557 9.09485 20C9 19.9443 9 19.8065 9 19.5309V16.45" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
            <path d="M10 22C7.17157 22 5.75736 22 4.87868 21.1213C4 20.2426 4 18.8284 4 16V8C4 5.17157 4 3.75736 4.87868 2.87868C5.75736 2 7.17157 2 10 2H14C16.8284 2 18.2426 2 19.1213 2.87868C20 3.75736 20 5.17157 20 8M14 22C16.8284 22 18.2426 22 19.1213 21.1213C20 20.2426 20 18.8284 20 16V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
          </g>
        </svg>
      </button>
    </>
  );
}

export default AccionesUnidad;
