import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { GameProvider, useGame } from '../context/GameContext';
import SpendMoney from './SpendMoney';
import Summary from './Summary';
import { useEffect } from 'react';

function Setup() {
  const { setBillionaire } = useGame();
  useEffect(() => {
    setBillionaire({
      id: '1',
      name: 'Mock Billionaire',
      description: '',
      image: '',
      netWorth: 100000000,
    });
  }, [setBillionaire]);
  return <SpendMoney />;
}

describe('SpendMoney', () => {
  it('navigates to summary after getting video', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/spend"]}>
        <GameProvider>
          <Routes>
            <Route path="/spend" element={<Setup />} />
            <Route path="/summary" element={<Summary />} />
          </Routes>
        </GameProvider>
      </MemoryRouter>
    );

    const plusButtons = screen.getAllByRole('button', { name: '+1' });
    await user.click(plusButtons[0]);
    await user.click(plusButtons[0]);

    const videoBtn = screen.getByRole('button', { name: /get your video/i });
    await user.click(videoBtn);

    expect(screen.getByText(/summary of your actions/i)).toBeInTheDocument();
  });
});
