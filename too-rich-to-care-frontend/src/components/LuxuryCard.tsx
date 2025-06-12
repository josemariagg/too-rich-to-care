import { motion } from 'framer-motion';

type LuxuryItem = {
  name: string;
  price: number;
  description: string;
  icon: string;
};

type Props = {
  item: LuxuryItem;
  onBuy: (item: LuxuryItem, quantity: number) => void;
};

export default function LuxuryCard({ item, onBuy }: Props) {
  const quantities = [1, 5, 10, 50, 100];

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="relative bg-[#1D2233] border border-[#2A2F40] rounded-2xl p-4 shadow-md flex flex-col items-center text-center"
    >
          <img src={`/animations/luxury-cart/${item.icon}.png`} alt={item.name} className="w-12 h-12" />
      <h3 className="text-lg font-bold text-yellow-300 mb-1">{item.name}</h3>
      <p className="text-sm text-gray-300 mb-2">{item.description}</p>
      <div className="text-green-400 font-semibold text-base mb-3">
        ${item.price.toLocaleString()}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {quantities.map((q) => (
          <button
            key={q}
            onClick={() => onBuy(item, q)}
            className="bg-yellow-300 text-black text-xs px-2 py-1 rounded-full hover:bg-yellow-400"
          >
            +{q}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

