"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function ExtensionDonePage() {
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
      if (window.chrome?.runtime?.sendMessage) {
        chrome.runtime.sendMessage(
          { action: "storeToken", token },
          (response) => {
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
