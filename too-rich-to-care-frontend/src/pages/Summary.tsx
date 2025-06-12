import { useNavigate, useLocation } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import GameLayout from '../components/GameLayout';

type LuxuryItem = {
  name: string;
  price: number;
  description?: string;
  icon?: string;
  category: string;
};

type ShoppingBagItem = {
  item: LuxuryItem;
  quantity: number;
};

export default function Summary() {
  const navigate = useNavigate();
  const location = useLocation();
  const { billionaire, spendingActions, totalSpent, resetGame, userId } = useGame();
  const shoppingBag: ShoppingBagItem[] = location.state?.shoppingBag || [];
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (shoppingBag.length === 0) {
      navigate('/spend');
      return;
    }

    setLoading(true);
    try {
      await fetch(import.meta.env.VITE_API_URL + '/choices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billionaire: billionaire?.name,
          userId,
        }),
      });

      const cartId = uuidv4();
      const items = shoppingBag.map((entry, index) => ({
        item_id: entry.item.name,
        item_name: entry.item.name,
        category: entry.item.category,
        quantity: entry.quantity,
        item_order: index,
      }));

      await fetch(`${import.meta.env.VITE_API_URL}/api/cart/save-cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId, userId, name, items }),
      });

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/payments/create-checkout-session`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, cartId }),
        }
      );

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('No se pudo iniciar el pago.');
      }
    } catch (err) {
      console.error('Error en checkout:', err);
      setError('Hubo un error al procesar el pago.');
    } finally {
      setLoading(false);
    }
  };

  if (!billionaire) {
    return (
      <div className="p-4">
        <p className="text-red-600">⚠️ No billionaire selected.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Back to start
        </button>
      </div>
    );
  }

  const remaining = billionaire.netWorth - totalSpent;

  return (
    <GameLayout>
    <div className="p-4 relative z-10">
      <h1 className="text-2xl font-bold mb-4">Summary of your actions</h1>
      <p className="mb-2 font-medium">Billionaire: {billionaire.name}</p>
      <p className="mb-2">Initial net worth: $ {billionaire.netWorth.toLocaleString()}</p>
      <p className="mb-4">Spent: $ {totalSpent.toLocaleString()} — Remaining: $ {remaining.toLocaleString()}</p>

      <h2 className="text-xl font-semibold mb-2">You spent on:</h2>
      <ul className="list-disc list-inside mb-6">
        {spendingActions.map((action, index) => (
          <li key={index}>
            {action.label} — $ {action.cost.toLocaleString()}
          </li>
        ))}
      </ul>

      <div className="mb-4">
        <label className="block mb-2">Tu nombre</label>
        <input
          className="w-full p-2 rounded text-black"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ingresa tu nombre"
        />
      </div>
      <p className="mb-6 text-gray-300">
        Al continuar serás redirigido a nuestra pasarela de pago segura para completar tu compra.
      </p>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="flex gap-4">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Pay for your video
        </button>
        <button
          onClick={() => {
            resetGame();
            navigate('/');
          }}
          className="px-4 py-2 bg-purple-600 text-white rounded"
        >
          Restart
        </button>
      </div>
    </div>
    </GameLayout>
  );
}
