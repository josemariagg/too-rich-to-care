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
      whileHover={{ scale: 1.05 }}
      className="relative bg-[#1D2233] border border-[#2A2F40] rounded-3xl p-5 shadow-xl flex flex-col items-center text-center hover:shadow-yellow-400/20"
    >
      <img
        src={`/animations/luxury-cart/${item.icon}.png`}
        alt={item.name}
        className="w-14 h-14 mb-2 drop-shadow-lg"
      />
      <h3 className="text-lg font-extrabold text-yellow-300 mb-1 tracking-wide">
        {item.name}
      </h3>
      <p className="text-sm text-gray-300 mb-2">{item.description}</p>
      <div className="text-green-400 font-bold text-base mb-4">
        ${item.price.toLocaleString()}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {quantities.map((q) => (
          <button
            key={q}
            onClick={() => onBuy(item, q)}
            className="bg-gradient-to-br from-yellow-300 to-pink-400 text-black text-xs px-3 py-1 rounded-full hover:from-yellow-200 hover:to-pink-300"
          >
            +{q}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

