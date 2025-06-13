import { useNavigate } from 'react-router-dom';
import GameLayout from '../components/GameLayout';

export default function PaymentError() {
  const navigate = useNavigate();
  return (
    <GameLayout>
    <div className="flex flex-col items-center justify-center p-4 relative z-10">
      <h1 className="text-2xl font-bold mb-4">Payment failed ❌</h1>
      <p className="mb-6 text-center max-w-md">
        There was a problem processing your payment. Please try again.
      </p>
      <button
        onClick={() => navigate('/spend')}
        className="px-4 py-2 bg-yellow-300 text-black rounded font-bold hover:bg-yellow-200 transition"
      >
        Back to store
      </button>
    </div>
    </GameLayout>
  );
}