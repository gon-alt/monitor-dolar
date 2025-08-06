#!/bin/bash

echo "🧩 Creando componente DolarMep.jsx en src/..."

cat > src/DolarMep.jsx <<EOF
import { useEffect, useState } from "react";

const ZONAS = {
  COMPRA: "compra",
  NEUTRA: "neutra",
  VENTA: "venta",
};

const getZona = (valor) => {
  if (valor < 1300) return ZONAS.COMPRA;
  if (valor > 1370) return ZONAS.VENTA;
  return ZONAS.NEUTRA;
};

const zonaColor = {
  [ZONAS.COMPRA]: "bg-green-100 text-green-800",
  [ZONAS.NEUTRA]: "bg-yellow-100 text-yellow-800",
  [ZONAS.VENTA]: "bg-red-100 text-red-800",
};

export default function DolarMep() {
  const [precio, setPrecio] = useState(null);
  const [zona, setZona] = useState(null);
  const [error, setError] = useState(null);

  const fetchPrecio = async () => {
    try {
      const res = await fetch("https://dolarapi.com/v1/dolares/mep");
      const data = await res.json();
      const valor = data.venta;
      setPrecio(valor);
      setZona(getZona(valor));
      setError(null);
    } catch (err) {
      setError("Error al consultar el precio");
    }
  };

  useEffect(() => {
    fetchPrecio();
    const interval = setInterval(fetchPrecio, 300000); // 5 minutos
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 max-w-md mx-auto mt-10 bg-white rounded-xl shadow-md space-y-4">
      <h1 className="text-2xl font-bold text-center">💵 Dólar MEP</h1>
      {error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : precio ? (
        <div className={\`text-center p-4 rounded \${zonaColor[zona]}\`}>
          <p className="text-xl font-semibold">Precio actual: ${precio}</p>
          <p className="text-sm italic">Zona: {zona}</p>
        </div>
      ) : (
        <p className="text-center text-gray-500">Cargando precio...</p>
      )}
    </div>
  );
}
EOF

echo "📁 Actualizando App.jsx para mostrar el componente..."

cat > src/App.jsx <<EOF
import DolarMep from "./DolarMep";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DolarMep />
    </div>
  );
}

export default App;
EOF

echo "✅ Componente DolarMep agregado y App.jsx actualizado"
echo "👉 Ejecutá 'npm run dev' para ver la app funcionando"