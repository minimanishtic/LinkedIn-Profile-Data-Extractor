import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import SaasLanding from "./components/SaasLanding";
import SingleUserApp from "./components/SingleUserApp";

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

          {/* Future SaaS routes will go here */}
          {/* <Route path="/dashboard" element={<Dashboard />} /> */}
          {/* <Route path="/auth/*" element={<AuthRoutes />} /> */}

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
