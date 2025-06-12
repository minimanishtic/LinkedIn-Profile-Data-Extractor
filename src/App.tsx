import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import SaasLanding from "./components/SaasLanding";
import SingleUserApp from "./components/SingleUserApp";
import SignupPage from "./components/Auth/SignupPage";
import LoginPage from "./components/Auth/LoginPage";
import AuthCallback from "./components/Auth/AuthCallback";
import ZohoCallback from "./components/Auth/ZohoCallback";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <div>
        <Analytics />
        <Routes>
          {/* SaaS Landing Page */}
          <Route path="/" element={<SaasLanding />} />

          {/* Single User App - Preserved existing functionality */}
          <Route path="/app/single-user" element={<SingleUserApp />} />

          {/* SaaS Authentication Routes */}
          <Route path="/auth/signup" element={<SignupPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/zoho/callback" element={<ZohoCallback />} />

          {/* SaaS Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<SingleUserApp />} />

          {/* Add this before any catchall route */}
          {import.meta.env.VITE_TEMPO === "true" && (
            <Route path="/tempobook/*" />
          )}
        </Routes>
      </div>
    </Suspense>
  );
}

export default App;
