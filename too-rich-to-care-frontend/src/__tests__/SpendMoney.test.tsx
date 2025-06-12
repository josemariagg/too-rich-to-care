import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SpendMoney from '../pages/SpendMoney';
import Summary from '../pages/Summary';
import { GameContext, Billionaire, SpendingAction } from '../context/GameContext';
import { ReactNode, useState } from 'react';

function TestGameProvider({ children, billionaire }: { children: ReactNode; billionaire: Billionaire }) {
  const [bState, setBillionaire] = useState<Billionaire | null>(billionaire);
  const [spendingActions, setSpendingActions] = useState<SpendingAction[]>([]);
  const addSpendingAction = (action: SpendingAction) => setSpendingActions(prev => [...prev, action]);
  const resetGame = () => {};
  const totalSpent = spendingActions.reduce((s, a) => s + a.cost, 0);
  const userId = 'test-user';
  return (
    <GameContext.Provider value={{ billionaire: bState, setBillionaire, spendingActions, addSpendingAction, setSpendingActions, resetGame, totalSpent, userId }}>
      {children}
    </GameContext.Provider>
  );
}

describe('SpendMoney page', () => {
  it('navigates to /summary after clicking Get your video', async () => {
    const dummyBillionaire: Billionaire = { id: '1', name: 'Tester', netWorth: 1000000, description: '', image: '' };

    render(
      <TestGameProvider billionaire={dummyBillionaire}>
        <MemoryRouter initialEntries={['/spend']} initialIndex={0}>
          <Routes>
            <Route path="/spend" element={<SpendMoney />} />
            <Route path="/summary" element={<Summary />} />
          </Routes>
        </MemoryRouter>
      </TestGameProvider>
    );

    const addButtons = await screen.findAllByText('+1');
    await userEvent.click(addButtons[0]);

    await userEvent.click(screen.getByRole('button', { name: /get your video/i }));

    expect(screen.getByText(/summary of your actions/i)).toBeInTheDocument();
  });
});
