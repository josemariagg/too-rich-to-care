import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Billionaire = {
  image: string;
  description: string;
  id: string;
  name: string;
  netWorth: number;
};

export type SpendingAction = {
  id: string;
  label: string;
  cost: number;
};

type GameContextType = {
  billionaire: Billionaire | null;
  setBillionaire: (b: Billionaire) => void;
  spendingActions: SpendingAction[];
  addSpendingAction: (action: SpendingAction) => void;
  setSpendingActions: (actions: SpendingAction[]) => void;
  resetGame: () => void;
  totalSpent: number;
  userId: string;
};

export const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [billionaire, setBillionaire] = useState<Billionaire | null>(null);
  const [spendingActions, setSpendingActions] = useState<SpendingAction[]>([]);
  const [userId] = useState(() => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    } else {
      return Math.random().toString(36).substring(2, 15);
    }
  });

  const addSpendingAction = (action: SpendingAction) => {
    setSpendingActions((prev) => [...prev, action]);
  };

  const resetGame = () => {
    setBillionaire(null);
    setSpendingActions([]);
  };

  const totalSpent = spendingActions.reduce((sum, action) => sum + action.cost, 0);

  return (
    <GameContext.Provider
      value={{
        billionaire,
        setBillionaire,
        spendingActions,
        addSpendingAction,
        setSpendingActions,
        resetGame,
        totalSpent,
        userId,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within a GameProvider");
  return context;
};
