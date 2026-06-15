/**
 * LoginScreen — shown when user is not authenticated.
 * Two modes:
 *  1. Cognito configured → "Sign in with Amazon" button → Cognito Hosted UI
 *  2. Cognito not configured → "Continue as Demo User" (demo mode, no redirect)
 */

import { useState } from "react";
import { ShoppingBag, Zap, Shield, Star } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const COGNITO_CONFIGURED =
  !!import.meta.env.VITE_COGNITO_DOMAIN &&
  !!import.meta.env.VITE_COGNITO_CLIENT_ID;

const FEATURES = [
  { icon: <Zap size={16} className="text-[#FF9900]" />,    text: "10-min delivery to your door" },
  { icon: <Star size={16} className="text-[#FF9900]" />,   text: "AI-powered smart reorders" },
  { icon: <Shield size={16} className="text-[#FF9900]" />, text: "Orders saved to your account" },
];

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    await signIn(); // redirect or demo login
    setLoading(false); // only reached in demo mode
  };

  return (
    <div className="max-w-sm mx-auto min-h-screen flex flex-col animate-fade-in">
      {/* Hero */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-8 pt-20 pb-12 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #1A1A2E 0%, #16213E 60%, #0F3460 100%)" }}
      >
        {/* Decorative orbs */}
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-[#FF9900]/10 blur-2xl" />
        <div className="absolute -left-12 bottom-0 w-40 h-40 rounded-full bg-white/5 blur-2xl" />

        {/* Logo */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 rounded-3xl bg-[#FF9900] flex items-center justify-center mb-5 shadow-2xl">
            <ShoppingBag size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-white font-display mb-1">NeedItNow</h1>
          <p className="text-white/60 text-sm text-center leading-relaxed mb-10">
            Groceries &amp; essentials in<br />
            <span className="text-[#FF9900] font-semibold">10 minutes</span>, delivered to your door
          </p>

          {/* Feature list */}
          <div className="w-full space-y-3 mb-10">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/10 rounded-2xl px-4 py-3">
                <div className="w-8 h-8 rounded-xl bg-[#FF9900]/20 flex items-center justify-center flex-shrink-0">
                  {f.icon}
                </div>
                <span className="text-white/80 text-sm font-medium">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-[#F7F8FC] px-6 pt-8 pb-12 space-y-4">
        <button
          onClick={handleSignIn}
          disabled={loading}
          className="w-full bg-[#FF9900] text-white rounded-full py-4 font-extrabold text-sm active:scale-95 transition-all shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ boxShadow: "0 4px 20px rgba(255,153,0,0.35)" }}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Signing in...
            </span>
          ) : COGNITO_CONFIGURED ? (
            "Sign in with Amazon →"
          ) : (
            "Continue as Demo User →"
          )}
        </button>

        {!COGNITO_CONFIGURED && (
          <p className="text-center text-xs text-gray-400 px-4">
            Cognito not yet configured — demo mode active.
            <br />Orders will still be saved to DynamoDB.
          </p>
        )}

        {COGNITO_CONFIGURED && (
          <p className="text-center text-xs text-gray-400">
            By continuing you agree to our Terms &amp; Privacy Policy
          </p>
        )}
      </div>
    </div>
  );
}
