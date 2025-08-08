import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

const Dolar = () => {
  const [precioCompra, setPrecioCompra] = useState(null);
  const [precioVenta, setPrecioVenta] = useState(null);
  const [bandaMinima, setBandaMinima] = useState(null);
  const [bandaMaxima, setBandaMaxima] = useState(null);
  const [alertaCompra, setAlertaCompra] = useState(null);
  const [alertaVenta, setAlertaVenta] = useState(null);
  const [estadoActual, setEstadoActual] = useState('Cargando...');
  const [historicoOficial, setHistoricoOficial] = useState([]);

  useEffect(() => {
    const obtenerDatosActuales = async () => {
      try {
        const response = await fetch('https://dolarapi.com/v1/dolares/oficial');
        const data = await response.json();

        setPrecioCompra(parseFloat(data.compra));
        setPrecioVenta(parseFloat(data.venta));
      } catch (error) {
        console.error('Error al obtener datos actuales:', error);
      }
    };

    const obtenerHistoricoOficial = async () => {
      try {
        const response = await fetch('https://api.bluelytics.com.ar/v2/evolution.json?days=90');
        const data = await response.json();

        const oficialData = data
          .filter(d => d.source === 'Oficial')
          .map(d => ({
            fecha: new Date(d.date).toLocaleDateString("es-AR"),
            compra: d.value_buy,
            venta: d.value_sell
          }));

        setHistoricoOficial(oficialData);

        // Calcular banda mínima y máxima con valores históricos
        const ventas = oficialData.map(d => d.venta);
        const minVenta = Math.min(...ventas);
        const maxVenta = Math.max(...ventas);

        setBandaMinima(minVenta.toFixed(2));
        setBandaMaxima(maxVenta.toFixed(2));

        // Calcular alertas (2% por encima de mínimo y por debajo del máximo)
        const alertaCompraCalc = parseFloat((minVenta * 1.02).toFixed(2));
        const alertaVentaCalc = parseFloat((maxVenta * 0.98).toFixed(2));

        setAlertaCompra(alertaCompraCalc);
        setAlertaVenta(alertaVentaCalc);

        // Determinar estado actual solo si ya se obtuvo precio actual
        if (precioVenta !== null) {
          if (precioVenta <= alertaCompraCalc) {
            setEstadoActual("🟢 Estado: Oportunidad de compra");
          } else if (precioVenta >= alertaVentaCalc) {
            setEstadoActual("🔴 Estado: Oportunidad de venta");
          } else {
            setEstadoActual("⚪ Estado: Neutral");
          }
        }
      } catch (error) {
        console.error('Error al obtener histórico oficial:', error);
      }
    };

    obtenerDatosActuales().then(obtenerHistoricoOficial);
  }, [precioVenta]);

  return (
    <div className="p-4 bg-white shadow-md rounded-lg text-center max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">💵 Dólar Oficial</h1>

      {precioVenta !== null && precioCompra !== null ? (
        <>
          <p>🛒 Compra: <strong>${precioCompra}</strong></p>
          <p>🏷️ Venta: <strong>${precioVenta}</strong></p>

          <p>🟢 Banda mínima: ${bandaMinima}</p>
          <p>🔴 Banda máxima: ${bandaMaxima}</p>

          <p>📉 Alerta de compra: ${alertaCompra}</p>
          <p>📈 Alerta de venta: ${alertaVenta}</p>

          <p className="text-lg font-bold mt-4">{estadoActual}</p>

          <hr className="my-4" />
          <h2 className="text-lg font-semibold mb-2">
            📊 Evolución del dólar oficial (últimos 90 días)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historicoOficial}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" interval={10} tick={{ fontSize: 12 }} />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip />
              <Line type="monotone" dataKey="venta" stroke="#8884d8" name="Venta" />
              <Line type="monotone" dataKey="compra" stroke="#82ca9d" name="Compra" />
            </LineChart>
          </ResponsiveContainer>
        </>
      ) : (
        <p>Cargando datos...</p>
      )}
    </div>
  );
};

export default Dolar;