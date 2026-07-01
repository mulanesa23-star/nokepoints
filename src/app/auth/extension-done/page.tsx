export const dynamic = "force-dynamic";

export default function ExtensionDonePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="w-16 h-16 rounded-full bg-kick/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-kick" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">¡Conectado!</h1>
        <p className="text-noke-muted text-sm">
          Tu cuenta se vinculó correctamente. La extensión se actualizará automáticamente.
        </p>
      </div>
    </div>
  );
}
