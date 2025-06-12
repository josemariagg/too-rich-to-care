import { useLocation, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Types matching the ones from SpendMoney
export type LuxuryItem = {
  name: string;
  price: number;
  description?: string;
  icon?: string;
  category: string;
};

export type ShoppingBagItem = {
  item: LuxuryItem;
  quantity: number;
};

export default function CheckoutReview() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId } = useGame();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const shoppingBag: ShoppingBagItem[] = location.state?.shoppingBag || [];

  const handlePayment = async () => {
    if (shoppingBag.length === 0) {
      navigate('/spend');
      return;
    }
    setLoading(true);
    const cartId = uuidv4();
    const items = shoppingBag.map((entry, index) => ({
      item_id: entry.item.name,
      item_name: entry.item.name,
      category: entry.item.category,
      quantity: entry.quantity,
      item_order: index,
    }));

    try {
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
        alert('No se pudo iniciar el pago.');
      }
    } catch (err) {
      console.error('Error en checkout:', err);
      alert('Hubo un error al procesar el pago.');
    } finally {
      setLoading(false);
    }
  };

  if (shoppingBag.length === 0) {
    return (
      <div className="p-4 text-white">
        <p>Tu bolsa está vacía.</p>
        <button
          onClick={() => navigate('/spend')}
          className="mt-4 px-4 py-2 bg-yellow-300 text-black rounded"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D0F1A] to-[#131623] text-white p-4 sm:p-8 font-sans">
      <h1 className="text-2xl font-bold mb-4">Resumen de tu compra</h1>
      <ul className="mb-4 space-y-2">
        {shoppingBag.map(({ item, quantity }) => (
          <li key={item.name} className="flex justify-between bg-[#1D2233] p-2 rounded">
            <span>
              {item.name} x{quantity}
            </span>
            <span>${(item.price * quantity).toLocaleString()}</span>
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
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-yellow-300 text-black py-2 rounded font-bold hover:bg-yellow-200 transition"
      >
        Continuar con el pago
      </button>
    </div>
  );
}