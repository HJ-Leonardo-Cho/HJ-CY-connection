import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { usePairingStatus } from "@/hooks/use-pairing";
import { useAppWebSocket } from "@/hooks/use-websocket";
import AuthPage from "./AuthPage";
import PairingPage from "./PairingPage";
import DashboardPage from "./DashboardPage";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  
  // We only fetch pairing status if authenticated
  const { data: pairingStatus, isLoading: pairingLoading } = usePairingStatus();
  
  // Setup global websocket for real-time syncing
  useAppWebSocket(isAuthenticated, pairingStatus?.isPaired ?? false);

  // Request notification permissions gracefully
  useEffect(() => {
    if (isAuthenticated && "Notification" in window && Notification.permission === "default") {
      // Small timeout so it doesn't block immediate render
      setTimeout(() => {
        Notification.requestPermission();
      }, 2000);
    }
  }, [isAuthenticated]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative z-10">
         <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // If authenticated but we don't have pairing data yet
  if (pairingLoading && !pairingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center relative z-10">
         <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!pairingStatus?.isPaired) {
    return <PairingPage />;
  }

  return <DashboardPage partner={pairingStatus.partner} />;
}
