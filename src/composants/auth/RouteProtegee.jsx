import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexte/FournisseurAuth";
import FullScreenLoader from "../interface/ChargeurPleinEcran";

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();
  const location = useLocation();


  if (loading) {
    return <FullScreenLoader label="Vérification de la session…" />;
  }


  if (!session) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }


  return children;
}
