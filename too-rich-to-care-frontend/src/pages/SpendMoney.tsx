import { useGame } from '../context/GameContext';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LuxuryCard from '../components/LuxuryCard';
import FallingItem from "../components/FallingItem";
import LuxuryCartAnimation from "../components/LuxuryCartAnimation";

// Types
type Category = 'Luxury' | 'Absurd' | 'World Impact' | 'Celebrity' | 'Hidden Gems';

type LuxuryItem = {
  name: string;
  price: number;
  description: string;
  icon: string;
  category: Category;
};

type ShoppingBagItem = {
  item: LuxuryItem;
  quantity: number;
  positions: { x: number; y: number }[];
};

const items: LuxuryItem[] = [
  { name: 'Private Island', price: 50000000, description: 'Because privacy is priceless.', icon: 'luxury-island', category: 'Luxury' },
  { name: 'Pet Tiger', price: 300000, description: 'Name it Bitcoin.', icon: 'tiger', category: 'Absurd' },
  { name: 'Diamond Toilet', price: 850000, description: 'Flush your wealth, literally.', icon: 'toilet-paper', category: 'Luxury' },
  { name: 'Custom Moon Base', price: 500000000, description: 'Elon would be jealous.', icon: 'moon-base', category: 'Absurd' },
  { name: 'Build a School', price: 1000000, description: 'Education for a village.', icon: 'school', category: 'World Impact' },
  { name: 'Fireworks Show (Dubai scale)', price: 1000000, description: 'Just because it’s Tuesday.', icon: 'fireworks', category: 'Celebrity' },
  { name: 'Money Shredder Art', price: 2000000, description: 'Shred it like Banksy.', icon: 'art', category: 'Hidden Gems' },
];

export default function SpendMoney() {
  const { billionaire } = useGame();
  const navigate = useNavigate();

  const [moneyLeft, setMoneyLeft] = useState(0);
  const [shoppingBag, setShoppingBag] = useState<ShoppingBagItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category>('Luxury');
  const [flashMessage, setFlashMessage] = useState<string>('');
  const [fallingItems, setFallingItems] = useState<{ id: string, icon: string, startX: number }[]>([]);

  useEffect(() => {
    if (!billionaire) {
      navigate('/');
    } else {
      setMoneyLeft(billionaire.netWorth);
    }
  }, [billionaire, navigate]);

  const netWorth = billionaire?.netWorth || 1;
  const spent = netWorth - moneyLeft;
  const percentage = Math.min((spent / netWorth) * 100, 100);
  let progressColor = "bg-green-400";
  if (percentage > 66) progressColor = "bg-red-500";
  else if (percentage > 33) progressColor = "bg-yellow-400";

  const handleBuy = (item: LuxuryItem, quantity: number) => {
    const totalCost = item.price * quantity;
    const newPositions = Array.from({ length: quantity }).map(() => ({
      x: Math.random() * 60 - 30,
      y: Math.random() * 40
    }));

    if (moneyLeft >= totalCost) {
      const messages = [
        `You just bought ${quantity}× ${item.name}. Why not?`,
        `Boom! $${totalCost.toLocaleString()} gone.`,
        `Luxury achieved: ${quantity}× ${item.name}`,
        `Your accountant is crying...`,
      ];
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      setFlashMessage(randomMsg);
      setTimeout(() => setFlashMessage(''), 2000);
      setShoppingBag((prev) => {
        const existing = prev.find((entry) => entry.item.name === item.name);
        if (existing) {
          return prev.map((entry) =>
            entry.item.name === item.name
              ? { ...entry, quantity: entry.quantity + quantity, positions: [...entry.positions, ...newPositions] }
              : entry
          );
        } else {
          return [...prev, { item, quantity, positions: newPositions }];
        }
      });
      setMoneyLeft((prev) => prev - totalCost);
    }
  };

  const handleRemove = (name: string) => {
    const removed = shoppingBag.find((entry) => entry.item.name === name);
    if (removed) {
      setMoneyLeft((prev) => prev + removed.item.price * removed.quantity);
    }
    setShoppingBag((prev) => prev.filter((entry) => entry.item.name !== name));
  };

  const updateQuantity = (name: string, delta: number) => {
    setShoppingBag((prev) =>
      prev.map((entry) =>
        entry.item.name === name ? { ...entry, quantity: entry.quantity + delta } : entry
      ).filter((entry) => entry.quantity > 0)
    );
    const item = shoppingBag.find((entry) => entry.item.name === name);
    if (item) {
      setMoneyLeft((prev) => prev - item.item.price * delta);
    }
  };

  const filteredItems = items.filter((i) => i.category === activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D0F1A] to-[#131623] text-white p-4 sm:p-8 font-sans overflow-x-hidden">
      {flashMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed top-4 text-center bg-yellow-300 text-black py-2 px-4 rounded-xl font-bold shadow-md z-50"
        >
          {flashMessage}
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row gap-6 max-w-[1200px] mx-auto">
        {/* COLUMN 1: Categorías */}
        <div className="order-1 md:order-none w-full md:w-[160px] shrink-0 space-y-4">
          <button onClick={() => navigate("/")} className="text-yellow-300 text-sm hover:underline">
            ← Back to billionaire selection
          </button>
          <div className="flex flex-col gap-2">
            {['Luxury', 'Absurd', 'World Impact', 'Celebrity', 'Hidden Gems'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat as Category)}
                className={`w-full px-4 py-2 rounded-full text-sm font-semibold transition ${
                  activeCategory === cat
                    ? 'bg-yellow-300 text-black'
                    : 'bg-[#2C2F40] text-white hover:bg-[#3A3F55]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* COLUMN 2: Tarjetas */}
        <div className="order-2 md:order-none w-full md:w-[280px] shrink-0 z-10">
          <h3 className="text-xl text-yellow-200 mb-4">🛍️ {activeCategory} Items</h3>
          <div className="flex flex-col gap-4">
            {filteredItems.map((item, idx) => (
              <LuxuryCard key={idx} item={item} onBuy={handleBuy} />
            ))}
          </div>
        </div>

        {/* COLUMN 3: Centro */}
        <div className="order-3 md:order-none flex-grow w-full min-w-0 flex flex-col items-center justify-end relative overflow-visible min-h-[500px] z-0">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-yellow-300 mb-2 tracking-tight z-10">
            Spend Like a Billionaire
          </h1>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-2xl sm:text-3xl font-bold text-green-400 z-10"
          >
            ${moneyLeft.toLocaleString()}
          </motion.div>

          <div id="fall-zone" className="relative w-full max-w-[600px] sm:w-[600px] h-[600px] sm:h-[660px] mx-auto bg-[#10131F] rounded-xl overflow-hidden -mt-20">
            <LuxuryCartAnimation x={128} y={200} width={360} fallingItems={fallingItems} />
            {fallingItems.map((item) => (
              <FallingItem key={item.id} id={item.id} icon={item.icon} />
            ))}
          </div>
        </div>

        {/* COLUMN 4: Bolsa */}
        <div className="order-4 md:order-none w-full md:w-[260px] shrink-0">
          <div className="bg-[#1D2233] p-4 rounded-xl border border-[#2A2F40]">
            <h3 className="text-lg text-yellow-200 mb-2">🧾 Shopping Bag</h3>
            {shoppingBag.length === 0 ? (
              <p className="text-gray-400 text-sm">No purchases yet.</p>
            ) : (
              <ul className="space-y-3 overflow-y-auto max-h-[50vh] pr-2">
                {shoppingBag.map(({ item, quantity }) => (
                  <motion.li
                    key={item.name}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex justify-between items-center text-sm bg-[#2A2F40] p-2 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <img src={`/animations/luxury-cart/${item.icon}.png`} alt={item.name} className="w-8 h-8 object-contain" />
                      <div className="flex flex-col">
                        <span>{item.name}</span>
                        <span className="text-xs text-gray-400">Qty: {quantity} | ${item.price * quantity}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.name, -1)} className="text-yellow-300 text-xs">➖</button>
                      <button onClick={() => updateQuantity(item.name, +1)} className="text-yellow-300 text-xs">➕</button>
                      <button onClick={() => handleRemove(item.name)} className="text-red-400 hover:text-red-300 text-xs">❌</button>
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
            <div className="mt-4 text-right text-green-400 font-bold">
              Total: ${shoppingBag.reduce((sum, entry) => sum + entry.item.price * entry.quantity, 0).toLocaleString()}
            </div>
            <div className="w-full bg-[#2A2F40] rounded-full h-3 mt-4">
              <div className={`h-3 rounded-full transition-all ${progressColor}`} style={{ width: `${percentage}%` }}></div>
            </div>
            <button
               onClick={() => navigate('/checkout', { state: { shoppingBag } })}
              className="mt-6 w-full bg-yellow-300 text-black text-base sm:text-lg py-3 rounded-full font-bold hover:bg-yellow-200 transition"
            >
              🔓 Customize & Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
