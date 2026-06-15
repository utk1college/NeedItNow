/**
 * LoginScreen — shown when user is not authenticated.
 * Uses Home_Page.png as the full-screen hero with the sign-in
 * button overlaid at the bottom (in the empty space).
 *  1. Cognito configured → "Sign in with Amazon" button → Cognito Hosted UI
 *  2. Cognito not configured → "Continue as Demo User" (demo mode, no redirect)
 */

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import homePage from "../assets/Home_Page.png";

const COGNITO_CONFIGURED =
  !!import.meta.env.VITE_COGNITO_DOMAIN &&
  !!import.meta.env.VITE_COGNITO_CLIENT_ID;

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    await signIn(); // redirect or demo login
    setLoading(false); // only reached in demo mode
  };

  return (
    <div className="max-w-sm mx-auto min-h-screen relative bg-[#F7F8FC] animate-fade-in">
      {/* Full home page image */}
      <img
        src={homePage}
        alt="NeedItNow"
        className="w-full h-auto block select-none pointer-events-none"
        draggable={false}
      />

      {/* Sign-in CTA — anchored to the bottom over the empty space */}
      <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-6 bg-gradient-to-t from-white via-white/95 to-transparent">
        <button
          onClick={handleSignIn}
          disabled={loading}
          className="w-full text-white rounded-full py-4 font-extrabold text-sm active:scale-95 transition-all shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
          style={{
            background: "linear-gradient(135deg, #FF9900 0%, #FF6B00 100%)",
            boxShadow: "0 4px 20px rgba(255,153,0,0.35)",
          }}
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

        <p className="text-center text-[10px] text-gray-400 mt-2.5">
          {COGNITO_CONFIGURED
            ? "By continuing you agree to our Terms & Privacy Policy"
            : "Demo mode · orders still saved to DynamoDB"}
        </p>
      </div>
    </div>
  );
}
