import { ReactNode } from 'react';

export default function GameLayout({ children }: { children: ReactNode }) {
  return (
    <div className="game-layout">
      <div className="bg-glow top-[-10%] -left-20 w-80 h-80 bg-pink-600"></div>
      <div className="bg-glow bottom-[-10%] right-[-20%] w-[28rem] h-[28rem] bg-yellow-400"></div>
      {children}
    </div>
  );
}
