import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { useEffect, useState } from 'react';
import GameLayout from '../components/GameLayout';

export default function Summary() {
  const navigate = useNavigate();
  const { billionaire, spendingActions, totalSpent, resetGame } = useGame();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/choices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billionaire,
          spendingActions,
          totalSpent,
        }),
      });

      if (!response.ok) throw new Error('Error al enviar al backend');

      setSubmitted(true);
      console.log('✅ Datos enviados correctamente');
    } catch (err) {
      console.error('❌ Error enviando al backend:', err);
      setError('Hubo un error al guardar tus datos.');
    }
  };

  if (!billionaire) {
    return (
      <div className="p-4">
        <p className="text-red-600">⚠️ No has seleccionado un billonario.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  const remaining = billionaire.netWorth - totalSpent;

  return (
    <GameLayout>
    <div className="p-4 relative z-10">
      <h1 className="text-2xl font-bold mb-4">Resumen de tus acciones</h1>
      <p className="mb-2 font-medium">Billonario: {billionaire.name}</p>
      <p className="mb-2">Fortuna inicial: $ {billionaire.netWorth.toLocaleString()}</p>
      <p className="mb-4">Gastado: $ {totalSpent.toLocaleString()} — Restante: $ {remaining.toLocaleString()}</p>

      <h2 className="text-xl font-semibold mb-2">Has gastado en:</h2>
      <ul className="list-disc list-inside mb-6">
        {spendingActions.map((action, index) => (
          <li key={index}>
            {action.label} — $ {action.cost.toLocaleString()}
          </li>
        ))}
      </ul>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {submitted && <p className="text-green-600 mb-4">✅ Datos enviados correctamente.</p>}

      <div className="flex gap-4">
        {!submitted && (
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Finalizar
          </button>
        )}
        <button
          onClick={() => {
            resetGame();
            navigate('/');
          }}
          className="px-4 py-2 bg-purple-600 text-white rounded"
        >
          Reiniciar
        </button>
      </div>
    </div>
    </GameLayout>
  );
}
