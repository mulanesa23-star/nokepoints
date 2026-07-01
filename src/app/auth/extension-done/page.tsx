"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic";

function ExtensionDoneContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      // Emit a custom event that the extension's content script will listen to
      const event = new CustomEvent("nokepointsTokenReady", {
        detail: { token },
      });
      window.dispatchEvent(event);

      // Also try direct extension communication as backup (for older Chrome versions)
      const chromeExt = (window as any).chrome;
      if (chromeExt?.runtime?.sendMessage) {
        chromeExt.runtime.sendMessage(
          { action: "storeToken", token },
          (response: any) => {
            if (response?.success) {
              console.log("Token stored in extension");
            }
          }
        ).catch(() => {
          // Direct communication failed, rely on content script
        });
      }

      // Redirect to Kick stream after short delay
      setTimeout(() => {
        window.location.href = "https://kick.com/soynokexd";
      }, 2000);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="w-16 h-16 rounded-full bg-kick/20 flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-kick"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">¡Conectado!</h1>
        <p className="text-noke-muted text-sm mb-4">
          Tu cuenta se vinculó correctamente. La extensión se actualizará
          automáticamente.
        </p>
        <p className="text-noke-muted text-xs">
          Redirigiendo a Kick en unos momentos...
        </p>
      </div>
    </div>
  );
}

export default function ExtensionDonePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kick mx-auto"></div>
          <p className="text-noke-muted mt-4">Cargando...</p>
        </div>
      </div>
    }>
      <ExtensionDoneContent />
    </Suspense>
  );
}
