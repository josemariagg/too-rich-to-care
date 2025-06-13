import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GameLayout from '../components/GameLayout';

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
  const [preview, setPreview] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [email, setEmail] = useState('');
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [selfieValid, setSelfieValid] = useState(false);

  useEffect(() => {
    if (selfie) {
      const objectUrl = URL.createObjectURL(selfie);
      setPreview(objectUrl);
      validateSelfie(selfie);
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }
    setPreview(null);
    setSelfieValid(false);
    setValidationMessage(null);
  }, [selfie]);

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
            setError('The video is not available yet.');
          }
        })
        .catch((err) => {
          console.error('❌ Error checking video:', err);
          setError('Could not fetch the video.');
        });
    }
  }, [location.search]);

  const handleGenerate = async () => {
    const params = new URLSearchParams(location.search);
    const cartId = params.get('cartId');
    if (!cartId || !selfie || !email || !selfieValid) {
      setError('You must upload a valid selfie and provide an email.');
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
        setMessage('Request sent. We will let you know when your video is ready.');
      } else {
        setError('Could not send the request.');
      }
    } catch (err) {
      console.error('❌ Error sending selfie:', err);
      setError('There was an error processing your selfie.');
    } finally {
      setGenerating(false);
    }
  };

  const startCamera = async () => {
    try {
      const userStream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = userStream;
      }
      setStream(userStream);
      setCameraActive(true);
    } catch (err) {
      console.error('❌ Error activating camera:', err);
      setError('Could not access the camera.');
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
          setSelfie(file);
        }
        stopCamera();
      }, 'image/jpeg');
    }
  };

  async function validateSelfie(file: File) {
    setValidationMessage(null);
    setSelfieValid(false);
    if (!file.type.startsWith('image/')) {
      setValidationMessage('Invalid image format.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setValidationMessage('Image is too large.');
      return;
    }
    try {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.src = url;
      await img.decode();
      if ('FaceDetector' in window) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const detector = new (window as any).FaceDetector();
        const faces = await detector.detect(img);
        if (faces.length !== 1) {
          setValidationMessage('Could not detect a clear face. Try again.');
          URL.revokeObjectURL(url);
          return;
        }
      }
      setSelfieValid(true);
      setValidationMessage('Selfie looks good!');
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('❌ Error validating selfie:', err);
      setValidationMessage('There was a problem validating the selfie.');
    }
  }

  return (
    <GameLayout>
    <div className="flex flex-col items-center justify-center p-4 relative z-10">
      <div className="glassy-card p-6 w-full max-w-md flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4">Payment confirmed ✅</h1>
        <p className="mb-4 text-center">
          Thank you for your purchase. Upload a selfie and provide an email so we can send your personalized video.
        </p>

        <div className="mb-4 p-3 bg-gray-800 rounded w-full text-sm">
          <p className="font-bold mb-1">📸 Take your selfie</p>
          <ul className="list-disc list-inside space-y-1 text-left">
            <li>Face the camera directly</li>
            <li>Use good lighting</li>
            <li>No sunglasses or masks</li>
            <li>Only one person</li>
          </ul>
          <p className="text-xs mt-2 text-center">(This helps us make your video look great)</p>
        </div>

      <div className="mb-4 flex flex-col items-center">
        {cameraActive ? (
          <>
            <video ref={videoRef} className="mb-2 w-64 h-48 bg-black rounded" />
            <button
              onClick={capturePhoto}
              className="mb-2 px-4 py-2 bg-yellow-300 text-black rounded font-bold hover:bg-yellow-200 transition"
            >
              Take photo
            </button>
            <button
              onClick={stopCamera}
              className="mb-2 px-4 py-2 bg-gray-500 text-white rounded font-bold hover:bg-gray-400 transition"
            >
              Close camera
            </button>
          </>
        ) : (
          <>
            {preview && (
              <>
                <img
                  src={preview}
                  alt="Selfie preview"
                  className="mb-2 w-32 h-32 object-cover rounded-full"
                />
                <button
                  onClick={() => setSelfie(null)}
                  className="mb-2 px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-400"
                >
                  Change photo
                </button>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelfie(e.target.files?.[0] || null)}
              className="mb-2 text-black"
            />
            <button
              onClick={startCamera}
              className="mb-2 px-4 py-2 bg-yellow-300 text-black rounded font-bold hover:bg-yellow-200 transition"
            >
              Use camera
            </button>
            {validationMessage && (
              <p className={`mb-2 ${selfieValid ? 'text-green-400' : 'text-yellow-300'}`}>{validationMessage}</p>
            )}
          </>
        )}
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 rounded text-black mb-2"
        />
        <button
          onClick={handleGenerate}
          disabled={generating || !selfieValid || !email}
          className="px-4 py-2 bg-yellow-300 text-black rounded font-bold hover:bg-yellow-200 transition disabled:opacity-50"
        >
          {generating ? 'Sending...' : 'Generate video'}
        </button>
        {message && <p className="mt-2 text-green-400 text-center">{message}</p>}
      </div>
      {downloadUrl ? (
        <a
          href={downloadUrl}
          className="mb-6 px-4 py-2 bg-yellow-300 text-black rounded font-bold hover:bg-yellow-200 transition"
        >
          Download video
        </a>
      ) : error ? (
        <p className="mb-6 text-gray-300">{error}</p>
      ) : (
        <p className="mb-6 text-gray-300">Generating download link...</p>
      )}
      <button
        onClick={() => navigate('/')}
        className="px-4 py-2 bg-yellow-300 text-black rounded font-bold hover:bg-yellow-200 transition"
      >
        Back to start
      </button>
    </div>
    </div>
    </GameLayout>
  );
}
