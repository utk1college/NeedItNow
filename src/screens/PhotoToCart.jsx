import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Upload, Search } from 'lucide-react';
import { callClaude, PROMPTS } from '../utils/claude';
import { safeParseJSON, formatPrice } from '../utils/helpers';
import { LoadingDots } from '../components/LoadingDots';
import { DeliveryBadge } from '../components/DeliveryBadge';
import { useCart } from '../context/CartContext';

const FALLBACK_RESULT = {
  detected: 'Dettol Antiseptic Liquid',
  suggestion: { name: 'Dettol Antiseptic Liquid 250ml', brand: 'Dettol', price: 89, category: 'health' },
};

// Tiny orange square as sample base64 image
const SAMPLE_B64 = 'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==';

export default function PhotoToCart() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const fileRef = useRef(null);

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [added, setAdded] = useState(false);

  const processImage = async (b64, previewUrl) => {
    setPreview(previewUrl);
    setResult(null);
    setAdded(false);
    try {
      setLoading(true);
      const { systemPrompt, userMessage } = PROMPTS.photoToCart();
      // Pass b64 so Gemini can actually see the image
      const raw = await callClaude(systemPrompt, userMessage, b64);
      const parsed = safeParseJSON(raw);
      setResult(parsed ?? FALLBACK_RESULT);
    } catch {
      setResult(FALLBACK_RESULT);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      const b64 = dataUrl.split(',')[1];
      processImage(b64, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSample = () => {
    processImage(SAMPLE_B64, `data:image/png;base64,${SAMPLE_B64}`);
  };

  const handleAdd = () => {
    if (!result?.suggestion) return;
    addItem({
      id: 'photo-item',
      name: result.suggestion.name,
      brand: result.suggestion.brand,
      price: result.suggestion.price,
      image: `https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=360/app/images/products/sliding_image/2680a.jpg`,
    });
    setAdded(true);
  };

  return (
    <div className="max-w-sm mx-auto min-h-screen pb-24 bg-[#F3F3F3] animate-fade-in">
      <div className="bg-white px-4 pt-10 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center active:scale-95 transition-all">
            <ArrowLeft size={18} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-base font-bold text-gray-900">Photo to Cart</h1>
            <p className="text-xs text-gray-400">Show us what you need</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-4">
        {/* Upload area */}
        <div
          onClick={() => fileRef.current?.click()}
          className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-[#FF9900] transition-colors active:scale-98"
        >
          {preview ? (
            <img src={preview} alt="Preview" className="w-32 h-32 rounded-xl object-cover" />
          ) : (
            <>
              <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center">
                <Camera size={28} className="text-[#FF9900]" />
              </div>
              <p className="text-sm font-semibold text-gray-700">Take a photo or upload</p>
              <p className="text-xs text-gray-400">We'll find the product instantly</p>
              <div className="flex items-center gap-2 mt-1">
                <Upload size={14} className="text-gray-400" />
                <span className="text-xs text-gray-400">Tap to open camera / gallery</span>
              </div>
            </>
          )}
        </div>

        <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />

        <button onClick={handleSample} className="w-full border border-gray-200 text-gray-700 rounded-full px-5 py-2.5 text-sm font-medium active:scale-95 transition-all text-center">
          ✨ Try a sample image
        </button>

        {loading && <LoadingDots message="Identifying product..." />}

        {result && !loading && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3 animate-slide-up">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">We found</p>
            <p className="text-sm font-semibold text-gray-500 italic">"{result.detected}"</p>
            <div className="h-px bg-gray-100" />
            <div className="flex items-center gap-3">
              <img
                src={`https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=360/app/images/products/sliding_image/2680a.jpg`}
                alt={result.suggestion.name}
                className="w-16 h-16 rounded-xl object-cover bg-gray-50"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 leading-tight">{result.suggestion.name}</p>
                <p className="text-xs text-gray-400 mb-1">{result.suggestion.brand}</p>
                <div className="flex items-center gap-2">
                  <p className="text-base font-bold text-gray-900">{formatPrice(result.suggestion.price)}</p>
                  <DeliveryBadge mins={14} />
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleAdd}
                className={`flex-1 py-3 rounded-full font-bold text-sm active:scale-95 transition-all ${added ? 'bg-green-500 text-white' : 'bg-[#FF9900] text-white'}`}
              >
                {added ? '✓ Added to cart' : 'Add to cart'}
              </button>
              <button className="flex-1 py-3 rounded-full font-semibold text-sm border border-gray-200 text-gray-700 active:scale-95 transition-all flex items-center justify-center gap-1">
                <Search size={14} />
                Search similar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

