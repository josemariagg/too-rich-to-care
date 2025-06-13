import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

type Props = {
  id: string;
  icon: string;
};

// Polygon coordinates on a 600x600 canvas
const polygon: [number, number][] = [
  [190, 410],
  [220, 520],
  [360, 530],
  [415, 515],
  [430, 445],
  [320, 380],
];

function pointInPolygon(x: number, y: number, polygon: [number, number][]) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi + Number.EPSILON) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function generateRandomPositionInsidePolygon(): { x: number; y: number } {
  for (let i = 0; i < 50; i++) {
    const x = 180 + Math.random() * 300;
    const y = 250 + Math.random() * 300;
    if (pointInPolygon(x, y, polygon)) {
      return { x, y };
    }
  }
  return { x: 300, y: 400 };
}

export default function FallingItem({ icon }: Props) {
  const [target, setTarget] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const pos = generateRandomPositionInsidePolygon();
    setTarget(pos);
  }, []);

  if (!target) return null;

  return (
    <motion.img
      src={`/animations/luxury-cart/${icon}.png`}
      alt={icon}
      initial={{
        x: target.x,
        y: -300,
        opacity: 0,
      }}
      animate={{
        x: target.x,
        y: target.y,
        opacity: 1,
        rotate: 360,
      }}
      transition={{ duration: 2.5, ease: 'easeOut' }}
      className="absolute w-10 h-10 z-30 pointer-events-none"
      style={{ left: 0 }}
    />
  );
}
