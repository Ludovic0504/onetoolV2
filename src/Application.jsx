import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import DashboardLayout from "./dispositions/DispositionTableauDeBord.jsx";
import RappelAuth from "./pages/RappelAuth.jsx";
import Accueil from "./pages/Accueil.jsx";
import Lab from "./pages/Lab.jsx";
import Prompt from "./pages/Prompt.jsx";
import ImagePage from "./pages/Image.jsx";
import VideoPage from "./pages/Video.jsx";
import Asavoir from "./pages/Asavoir.jsx";
import Connexion from "./pages/Connexion.jsx";
import RouteDeconnexion from "./pages/RouteDeconnexion.jsx";
import Profil from "./pages/Profil.jsx";
import MentionsLegales from "./pages/MentionsLegales.jsx";
import ChargeurInitial from "./composants/interface/ChargeurInitial.jsx";
import ProtectedRoute from "./composants/auth/RouteProtegee.jsx";

export default function App() {
  const [showInitialLoader, setShowInitialLoader] = useState(true);

  const handleEnter = () => {
    setShowInitialLoader(false);
  };


  if (showInitialLoader) {
    return <ChargeurInitial onEnter={handleEnter} />;
  }

  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/login" element={<Connexion />} />
      <Route path="/logout" element={<RouteDeconnexion />} />
      <Route path="/auth/callback" element={<RappelAuth />} />
      <Route path="/" element={<Accueil />} />

      {/* Routes avec layout dashboard */}
      <Route element={<DashboardLayout />}>
        {/* Routes publiques avec layout */}
        <Route path="/lab" element={<Lab />} />
        <Route path="/a-savoir" element={<Asavoir />} />
        <Route path="/mentions-legales" element={<MentionsLegales />} />
        
        {/* Redirection */}
        <Route path="/dashboard" element={<Navigate to="/" replace />} />

        {/* Routes protégées - nécessitent une authentification */}
        <Route
          path="/prompt"
          element={
            <ProtectedRoute>
              <Prompt />
            </ProtectedRoute>
          }
        />
        <Route
          path="/image"
          element={
            <ProtectedRoute>
              <ImagePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/video"
          element={
            <ProtectedRoute>
              <VideoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profil"
          element={
            <ProtectedRoute>
              <Profil />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Route catch-all - redirige vers l'accueil */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
