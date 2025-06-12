import { motion } from 'framer-motion';

type Props = {
  startX: number;
};

export default function AnimatedBill({ startX }: Props) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{
        x: [startX, startX + 80, 200],
        y: [300, 100, -150],
        opacity: [1, 1, 0],
        rotate: 720,
        scale: [1, 1.1, 0.5],
      }}
      transition={{ duration: 2, ease: "easeInOut" }}
      className="absolute text-2xl pointer-events-none"
    >
      💸
    </motion.div>
  );
}

