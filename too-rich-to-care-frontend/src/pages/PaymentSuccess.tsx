import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === 'string') resolve(result);
      else reject(new Error('Failed to read file'));
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [email, setEmail] = useState('');
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cartId = params.get('cartId');
    if (cartId) {
      const url = `${import.meta.env.VITE_API_URL}/api/videos/${cartId}`;
      fetch(url, { method: 'HEAD' })
        .then((res) => {
          if (res.ok) {
            setDownloadUrl(url);
          } else {
            setError('El video aún no está disponible.');
          }
        })
        .catch((err) => {
          console.error('❌ Error verificando el video:', err);
          setError('No se pudo obtener el video.');
        });
    }
  }, [location.search]);

  const handleGenerate = async () => {
    const params = new URLSearchParams(location.search);
    const cartId = params.get('cartId');
    if (!cartId || !selfie || !email) {
      setError('Debes subir una selfie y escribir un correo.');
      return;
    }
    setGenerating(true);
    setError(null);
    setMessage(null);
    try {
      const selfieData = await fileToBase64(selfie);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/videos/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId, email, selfie: selfieData }),
      });
      if (res.ok) {
        setMessage('Solicitud enviada. Te avisaremos cuando el video esté listo.');
      } else {
        setError('No se pudo enviar la solicitud.');
      }
    } catch (err) {
      console.error('❌ Error enviando selfie:', err);
      setError('Ocurrió un error al procesar tu selfie.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D0F1A] to-[#131623] text-white flex flex-col items-center justify-center p-4 font-sans">
      <h1 className="text-2xl font-bold mb-4">Pago confirmado ✅</h1>
      <p className="mb-4 text-center max-w-md">
        Gracias por tu compra. Para finalizar sube una selfie y un correo donde enviaremos tu video personalizado.
      </p>

      <div className="mb-4 flex flex-col items-center">
        <input
          type="file"
          accept="image/*"
          capture="user"
          onChange={(e) => setSelfie(e.target.files?.[0] || null)}
          className="mb-2 text-black"
        />
        <input
          type="email"
          placeholder="tu@correo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 rounded text-black mb-2"
        />
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="px-4 py-2 bg-yellow-300 text-black rounded font-bold hover:bg-yellow-200 transition disabled:opacity-50"
        >
          {generating ? 'Enviando...' : 'Generar video'}
        </button>
        {message && <p className="mt-2 text-green-400 text-center">{message}</p>}
      </div>
      {downloadUrl ? (
        <a
          href={downloadUrl}
          className="mb-6 px-4 py-2 bg-yellow-300 text-black rounded font-bold hover:bg-yellow-200 transition"
        >
          Descargar video
        </a>
      ) : error ? (
        <p className="mb-6 text-gray-300">{error}</p>
      ) : (
        <p className="mb-6 text-gray-300">Generando enlace de descarga...</p>
      )}
      <button
        onClick={() => navigate('/')}
        className="px-4 py-2 bg-yellow-300 text-black rounded font-bold hover:bg-yellow-200 transition"
      >
        Volver al inicio
      </button>
    </div>
  );
}