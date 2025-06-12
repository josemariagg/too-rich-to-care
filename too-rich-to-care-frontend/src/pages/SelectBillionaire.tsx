import { useNavigate } from 'react-router-dom';
import { useGame, Billionaire } from '../context/GameContext';

const billionaires: Billionaire[] = [
  {
    id: 'bezos',
    name: 'Jeff Bezos',
    netWorth: 160000000000,
    image: '/assets/JB.png',
    description: 'Amazon’s overlord. Richer than the GDP of entire nations.',
  },
  {
    id: 'musk',
    name: 'Elon Musk',
    netWorth: 180000000000,
    image: '/assets/EM.png',
    description: 'Tesla, SpaceX, and a dozen ventures… more wealth than hours in the day.',
  },
  {
    id: 'zuck',
    name: 'Mark Zuckerberg',
    netWorth: 100000000000,
    image: '/assets/MZ.png',
    description: 'Social media mastermind behind Facebook and Instagram. Now let’s see how fast you can drain his billions.',
  },
];

export default function SelectBillionaire() {
  const { setBillionaire, userId } = useGame(); // ✅ usamos userId
  const navigate = useNavigate();

  const handleSelect = async (b: Billionaire) => {
    console.log("📌 Millonario seleccionado:", b);
    setBillionaire(b);

    // ✅ Enviar la elección al backend
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/choices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billionaire: b.name,
          userId: userId, // ✅ enviado como userId
        }),
      });

      if (!res.ok) {
        console.error('❌ Error al guardar la elección:', await res.text());
      } else {
        console.log('✅ Elección enviada correctamente');
      }
    } catch (err) {
      console.error('❌ Error en fetch /choices:', err);
    }

    navigate('/spend');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D0F1A] to-[#131623] text-white flex flex-col items-center py-10 px-4 font-sans">
      <img
        src="/assets/LogoB.png"
        alt="Too Rich To Care logo"
        className="w-72 mb-6 drop-shadow-lg"
      />
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-yellow-300 text-center mb-4 tracking-tight">
        Can you bankrupt a billionaire?
      </h1>
      <p className="text-md sm:text-lg md:text-xl text-gray-300 text-center max-w-2xl mb-12 leading-relaxed">
        Choose a billionaire and start burning money on absurd luxuries.<br />
        Can you bring them to zero?
      </p>

      <div className="flex flex-wrap justify-center gap-6 sm:gap-8 max-w-4xl mx-auto">
        {billionaires.map((b, index) => (
          <div
            key={index}
            className="billionaire-card"
            onClick={() => handleSelect(b)}
          >
            <div className="flex-grow flex items-center justify-center">
              <img
                src={b.image}
                alt={b.name}
                className="h-36 sm:h-40 md:h-44 object-contain drop-shadow-md"
              />
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-accent-yellow uppercase tracking-wide">
              {b.name}
            </h2>
            <p className="text-sm sm:text-base text-gray-300 leading-snug max-w-[16ch] mx-auto">
              {b.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
