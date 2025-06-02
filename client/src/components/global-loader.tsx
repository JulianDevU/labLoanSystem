 "use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

export function GlobalLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    // El loader se muestra inmediatamente y se oculta tras un pequeño delay
    const timeout = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timeout);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
}
