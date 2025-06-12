import { useGame } from '../context/GameContext';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LuxuryCard from '../components/LuxuryCard';
import GameLayout from '../components/GameLayout';

// Types
type Category = 'Luxury' | 'Absurd' | 'World Impact' | 'Celebrity' | 'Hidden Gems';

type LuxuryItem = {
  name: string;
  price: number;
  description: string;
  icon: string;
  category: Category;
};

type BagItem = {
  item: LuxuryItem;
  quantity: number;
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
  const [bag, setBag] = useState<BagItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category>('Luxury');
  const [flashMessage, setFlashMessage] = useState<string>('');

  useEffect(() => {
    if (!billionaire) {
      navigate('/');
    } else {
      setMoneyLeft(billionaire.netWorth);
    }
  }, [billionaire, navigate]);

  const netWorth = billionaire?.netWorth || 1;

  const handleBuy = (item: LuxuryItem, quantity: number) => {
    const totalCost = item.price * quantity;
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
      setBag((prev) => {
        const existing = prev.find((e) => e.item.name === item.name);
        if (existing) {
          return prev.map((e) =>
            e.item.name === item.name ? { ...e, quantity: e.quantity + quantity } : e
          );
        }
        return [...prev, { item, quantity }];
      });
      setMoneyLeft((prev) => prev - totalCost);
    }
  };

  const handleRemove = (name: string) => {
    const removed = bag.find((e) => e.item.name === name);
    if (removed) {
      setMoneyLeft((prev) => prev + removed.item.price * removed.quantity);
    }
    setBag((prev) => prev.filter((e) => e.item.name !== name));
  };

  const updateQuantity = (name: string, delta: number) => {
    const entry = bag.find((e) => e.item.name === name);
    if (!entry) return;
    const costChange = entry.item.price * delta;
    if (delta > 0 && moneyLeft < costChange) return;

    setBag((prev) =>
      prev
        .map((e) =>
          e.item.name === name ? { ...e, quantity: e.quantity + delta } : e
        )
        .filter((e) => e.quantity > 0)
    );
    setMoneyLeft((prev) => prev - costChange);
  };

  const filteredItems = items.filter((i) => i.category === activeCategory);

  return (
    <GameLayout>
    <div className="p-4 sm:p-8 overflow-x-hidden relative z-10">
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
                className={`w-full px-4 py-3 rounded-xl text-sm font-bold transform transition hover:-translate-y-1 ${
                  activeCategory === cat
                    ? 'bg-gradient-to-r from-yellow-300 to-pink-400 text-black shadow-lg'
                    : 'bg-[#1D2233] text-white hover:bg-[#2A314A]'
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

          <div id="fall-zone" className="relative w-full max-w-[600px] sm:w-[600px] h-[600px] sm:h-[660px] mx-auto bg-[#10131F] rounded-xl overflow-hidden -mt-20 flex items-center justify-center">
            <span className="text-gray-600">Buy something to burn that cash!</span>
          </div>
        </div>

        {/* COLUMN 4: Purchases */}
        <div className="order-4 md:order-none w-full md:w-[260px] shrink-0">
          <div className="bg-[#1D2233] p-4 rounded-xl border border-[#2A2F40]">
            <h3 className="text-lg text-yellow-200 mb-2">🧾 Items Bought</h3>
            {bag.length === 0 ? (
              <p className="text-gray-400 text-sm">No purchases yet.</p>
            ) : (
              <ul className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                {bag.map(({ item, quantity }) => (
                  <li key={item.name} className="flex justify-between items-center text-sm bg-[#2A2F40] p-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <img src={`/animations/luxury-cart/${item.icon}.png`} alt={item.name} className="w-6 h-6" />
                      <span>{item.name} × {quantity}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateQuantity(item.name, -1)} className="text-yellow-300 text-xs">➖</button>
                      <button onClick={() => updateQuantity(item.name, +1)} className="text-yellow-300 text-xs">➕</button>
                      <button onClick={() => handleRemove(item.name)} className="text-red-400 text-xs">❌</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
    </GameLayout>
  );
}
