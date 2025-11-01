import { useState, useEffect } from "react";
import { RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Status = "loading" | "success" | "error" | "idle";

export function CookieStatus() {
  const [status, setStatus] = useState<Status>("idle");
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkCookie = async () => {
    setIsChecking(true);
    setError(null);
    setStatus("loading");

    try {
      const response = await fetch("/api/cookie-status");
      const data = await response.json();

      if (data.status === "success") {
        setStatus("success");
      } else {
        setStatus("error");
        setError("Failed to load cookie");
      }
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to check cookie");
    } finally {
      setIsChecking(false);
    }
  };

  const fetchCookie = async () => {
    setIsChecking(true);
    setError(null);
    setStatus("loading");

    try {
      const response = await fetch("/api/fetch-cookie");
      const data = await response.json();

      if (data.success) {
        setStatus("success");
        setError(null);
      } else {
        setStatus("error");
        setError(data.error || "Failed to fetch cookie");
      }
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to fetch cookie");
    } finally {
      setIsChecking(false);
    }
  };

  // Check cookie status on mount
  useEffect(() => {
    checkCookie();
  }, []);

  const statusColor = {
    success:
      "bg-green-500/20 hover:bg-green-500/30 border-green-500/50 text-green-300",
    error: "bg-red-500/20 hover:bg-red-500/30 border-red-500/50 text-red-300",
    loading: "bg-yellow-500/20 border-yellow-500/50 text-yellow-300",
    idle: "bg-slate-700/50 border-slate-600 text-slate-300",
  };

  const Icon =
    status === "success"
      ? CheckCircle2
      : status === "error"
        ? AlertCircle
        : RefreshCw;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex flex-col gap-2">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-3 py-2 rounded-lg text-sm max-w-xs">
            {error}
          </div>
        )}
        <Button
          onClick={status === "success" ? checkCookie : fetchCookie}
          disabled={isChecking}
          className={`${statusColor[status]} border flex items-center gap-2 transition-all`}
          variant="outline"
        >
          <Icon className={`w-4 h-4 ${isChecking ? "animate-spin" : ""}`} />
          <span className="text-xs font-semibold">
            {status === "loading"
              ? "Checking..."
              : status === "success"
                ? "Cookie Ready"
                : "Fetch Cookie"}
          </span>
        </Button>
      </div>
    </div>
  );
}
