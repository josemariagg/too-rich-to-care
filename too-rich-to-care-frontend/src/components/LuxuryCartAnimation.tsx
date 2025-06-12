import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';

type Props = {
  x: number;
  y: number;
  width?: number;
  fallingItems: { id: string; icon: string }[];
};

export default function LuxuryCartAnimation({ x, y, width = 240, fallingItems }: Props) {
  const controls = useAnimation();

  // Trigger bounce animation when items fall
  useEffect(() => {
    if (fallingItems.length > 0) {
      controls.start({
        scale: [1, 1.1, 0.95, 1],
        transition: { duration: 0.6 },
      });
    }
  }, [fallingItems.length, controls]);

  return (
    <motion.img
      src="/animations/luxury-cart/cart.png"
      alt="Luxury Cart"
      animate={controls}
      initial={{ scale: 1 }}
      className="absolute pointer-events-none z-20"
      style={{
        left: x,
        top: y,
        width: `${width}px`,
      }}
    />
  );
}
