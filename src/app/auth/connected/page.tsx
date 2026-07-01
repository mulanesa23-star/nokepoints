import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ConnectedPage() {
  const session = await getSession();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        {session.userId ? (
          <>
            <div className="w-16 h-16 rounded-full bg-kick/20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-kick" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">¡Conectado!</h1>
            <p className="text-noke-muted text-sm mb-8">
              Tu cuenta de Kick se vinculó correctamente con NokePoints.
              Ya podés cerrar esta ventana.
            </p>
            <p className="text-xs text-noke-muted">La extensión se actualizará automáticamente.</p>

            <script
              dangerouslySetInnerHTML={{
                __html: `
                  (function() {
                    if (window.opener && !window.opener.closed) {
                      window.opener.postMessage({ action: "nokepoints-login" }, "*");
                    }
                    setTimeout(function() {
                      window.close();
                    }, 1500);
                  })();
                `,
              }}
            />
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-2">No conectado</h1>
            <p className="text-noke-muted text-sm mb-8">
              No se encontró una sesión activa. Iniciá sesión desde la extensión o la página principal.
            </p>
            <a href="/" className="inline-block bg-kick text-black font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition text-sm">
              Volver al inicio
            </a>
          </>
        )}
      </div>
    </div>
  );
}