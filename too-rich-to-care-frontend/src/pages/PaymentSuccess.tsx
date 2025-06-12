import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D0F1A] to-[#131623] text-white flex flex-col items-center justify-center p-4 font-sans">
      <h1 className="text-2xl font-bold mb-4">Pago confirmado ✅</h1>
      <p className="mb-4 text-center max-w-md">
        Gracias por tu compra. Estamos generando tu video personalizado. Cuando esté listo podrás descargarlo a continuación.
      </p>
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