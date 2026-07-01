import Link from "next/link";
import { getPointsConfig } from "@/lib/points";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

async function getConfig() {
  try {
    return await getPointsConfig();
  } catch {
    return null;
  }
}

export default async function ExtensionPage() {
  const cfg = await getConfig();
  const session = await getSession();
  const ptsPerTick = cfg?.POINTS_PER_TICK ?? 100;
  const subMultiplier = cfg?.SUBSCRIBER_MULTIPLIER ?? 2;
  const tickInterval = cfg?.TICK_INTERVAL_MS ?? 120000;
  const chatBonus = cfg?.CHAT_BONUS_PER_MSG ?? 10;
  const dailyChatLimit = cfg?.DAILY_CHAT_BONUS_LIMIT ?? 50;

  return (
    <>
      <section className="relative py-8 md:py-12 overflow-hidden">
        <div
          className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 opacity-[0.05]"
          style={{
            backgroundImage: "url(/KICK_FRAMEGREEN.svg)",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
          }}
        />

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="inline-flex items-center gap-2 bg-kick/10 text-kick text-xs font-semibold px-4 py-1.5 rounded-full border border-kick/20">
            <img src="/kick-green.svg" alt="" className="w-4 h-4" />
            EXTENSIÓN
          </div>

          {session.userId ? (
            <div className="inline-flex items-center gap-1.5 bg-kick/10 text-kick text-xs font-semibold px-4 py-1.5 rounded-full border border-kick/20">
              <span className="w-2 h-2 rounded-full bg-kick" />
              Sesión activa
            </div>
          ) : (
            <Link
              href="/api/auth/kick-start"
              className="inline-flex items-center gap-1.5 bg-yellow-500/10 text-yellow-400 text-xs font-semibold px-4 py-1.5 rounded-full border border-yellow-500/20 hover:bg-yellow-500/20 transition"
            >
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
              Pendiente — Conectar con Kick
            </Link>
          )}
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          Extensión para{" "}
          <span className="text-kick">NokePoints</span>
        </h1>
        <p className="text-noke-muted text-base md:text-lg mt-4 max-w-2xl">
          Instalala en tu navegador y empezá a acumular puntos automáticamente
          mientras ves los streams de soynokexd.
        </p>
      </section>

      <section className="py-10">
        <h2 className="text-2xl font-bold mb-6">
          <span className="text-kick">›</span> Cómo funciona
        </h2>

        <div className="space-y-10">
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
            <div className="w-full md:w-48 shrink-0">
              <div className="flex items-center gap-3 mb-2">
                <img src="/KICK_FRAMEGREEN.svg" alt="" className="w-7 h-7" />
                <span className="text-kick text-2xl font-bold">01</span>
              </div>
              <h3 className="text-lg font-semibold">Detección automática</h3>
            </div>
            <div className="text-noke-muted text-sm md:text-base leading-relaxed">
              <p>
                Apenás entrás a{" "}
                <strong className="text-white">kick.com/soynokexd</strong>, la
                extensión detecta el canal y verifica si el stream está en vivo.
                No hace nada en otros canales ni en otras páginas.
              </p>
              <p className="mt-3 text-xs text-noke-muted border-l-2 border-kick/30 pl-3 italic">
                &ldquo;Solo escucha cuando el canal es soynokexd. Fuera de ahí,
                está dormida.&rdquo;
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
            <div className="w-full md:w-48 shrink-0">
              <div className="flex items-center gap-3 mb-2">
                <img src="/KICK_FRAMEGREEN.svg" alt="" className="w-7 h-7" />
                <span className="text-kick text-2xl font-bold">02</span>
              </div>
              <h3 className="text-lg font-semibold">Watchtime tracking</h3>
            </div>
            <div className="text-noke-muted text-sm md:text-base leading-relaxed">
              <p>
                Mientras el stream está en vivo y la pestaña tiene el video en
                    foco, la extensión envía un <strong className="text-white">
                    heartbeat</strong> cada <strong className="text-white">
                    {tickInterval / 60000} minutos</strong> al servidor de NokePoints.
              </p>
              <p className="mt-2">
                Cada heartbeat te acredita <strong className="text-white">
                {ptsPerTick} puntos base</strong>. Si estás suscripto al canal, recibir&iacute;as{" "}
                <strong className="text-white">{ptsPerTick * subMultiplier} puntos</strong> por tick
                (bonus x{subMultiplier}).
              </p>
              <p className="mt-2 text-xs text-noke-muted">
                El servidor valida la sesión en cada heartbeat.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
            <div className="w-full md:w-48 shrink-0">
              <div className="flex items-center gap-3 mb-2">
                <img src="/KICK_FRAMEGREEN.svg" alt="" className="w-7 h-7" />
                <span className="text-kick text-2xl font-bold">03</span>
              </div>
              <h3 className="text-lg font-semibold">Anti-AFK</h3>
            </div>
            <div className="text-noke-muted text-sm md:text-base leading-relaxed">
              <p>
                Para evitar el farming pasivo, la extensión verifica que
                realmente estés viendo el stream. Si la pestaña está en segundo
                plano, el video está pausado o no hay interacción, la
                recolección <strong className="text-white">se pausa</strong>{" "}
                automáticamente.
              </p>
              <p className="mt-2 text-xs text-noke-muted">
                Solo cuenta cuando el video se está reproduciendo activamente en
                tu pantalla.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
            <div className="w-full md:w-48 shrink-0">
              <div className="flex items-center gap-3 mb-2">
                <img src="/KICK_FRAMEGREEN.svg" alt="" className="w-7 h-7" />
                <span className="text-kick text-2xl font-bold">04</span>
              </div>
              <h3 className="text-lg font-semibold">Bonus por chat</h3>
            </div>
            <div className="text-noke-muted text-sm md:text-base leading-relaxed">
              <p>
                Además del watchtime, cada mensaje que mandás en el chat te da{" "}
                <strong className="text-white">{chatBonus} puntos extra</strong>.
              </p>
              <p className="mt-2">
                La extensión detecta cuándo apretás Enter y envía el bonus al
                servidor. Hay un límite de <strong className="text-white">
                {dailyChatLimit} mensajes</strong> por día para evitar abusos.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
            <div className="w-full md:w-48 shrink-0">
              <div className="flex items-center gap-3 mb-2">
                <img src="/KICK_FRAMEGREEN.svg" alt="" className="w-7 h-7" />
                <span className="text-kick text-2xl font-bold">05</span>
              </div>
              <h3 className="text-lg font-semibold">Estado en vivo</h3>
            </div>
            <div className="text-noke-muted text-sm md:text-base leading-relaxed">
              <p>
                Desde el popup de la extensión pod&eacute;s ver tu estado actual
                en cualquier momento:
              </p>
              <ul className="mt-3 space-y-2">
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 shrink-0" />
                  <span><strong className="text-white">Disconnected</strong> &mdash; no inici&aacute;ste sesión en NokePoints</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                  <span><strong className="text-white">Offline</strong> &mdash; el stream no está en vivo</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-kick shrink-0" />
                  <span><strong className="text-white">Farming</strong> &mdash; todo ok, estás ganando puntos</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-gray-500 shrink-0" />
                  <span><strong className="text-white">Paused</strong> &mdash; la pestaña no está activa o el video está pausado</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 border-t border-white/5">
        <h2 className="text-2xl font-bold mb-6">
          <span className="text-kick">›</span> Privacidad y seguridad
        </h2>
        <div className="card text-noke-muted text-sm space-y-3">
          <p>
            <strong className="text-white">Solo kick.com:</strong> la extensión
            corre únicamente en kick.com. No lee ni modifica ningún otro sitio.
          </p>
          <p>
            <strong className="text-white">Solo soynokexd:</strong> solo se
            activa en el canal de soynokexd. Si navegás a otro canal, la
            extensión queda inactiva.
          </p>
          <p>
            <strong className="text-white">Sin datos sensibles:</strong> la
            extensión envía únicamente tu username, el canal actual y un
            contador de ticks al servidor de NokePoints. No recolecta
            contraseñas, tokens de Kick ni datos personales.
          </p>
          <p>
            <strong className="text-white">Código abierto:</strong> pod&eacute;s
            revisar el código fuente completo de la extensión para verificar
            que no hace nada raro.
          </p>
        </div>
      </section>

      <section className="py-10 border-t border-white/5">
        <h2 className="text-2xl font-bold mb-6">
          <span className="text-kick">›</span> Instalación
        </h2>

        <div className="card text-sm text-noke-muted space-y-4">
          <div>
            <h3 className="text-white font-semibold mb-1">1. Iniciá sesión en Kick</h3>
            <p>
              Asegurate de estar logueado en{" "}
              <a href="https://kick.com" target="_blank" rel="noopener noreferrer" className="text-kick hover:underline">kick.com</a>.
              La extensión usa tu cuenta de Kick para identificar quién sos.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">2. Conectá tu cuenta</h3>
            <p>
              Hacé clic en <strong className="text-white">Conectar con
              Kick</strong> en la página principal de NokePoints y autorizá la
              conexión. Esto vincula tu cuenta de Kick con NokePoints.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">3. Instalá la extensión</h3>
            <p>
              Descargala desde Chrome Web Store o Firefox Add-ons. Una vez
              instalada, la extensión aparece en la barra de herramientas del
              navegador.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">4. Disfrutá</h3>
            <p>
              Entrá a{" "}
              <Link href="https://kick.com/soynokexd" target="_blank" rel="noopener noreferrer" className="text-kick hover:underline">kick.com/soynokexd</Link>
              {" "}cuando haya stream en vivo y empezá a sumar puntos
              automáticamente.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
          <a
            href="#"
            className="bg-noke-card text-white font-semibold px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition text-sm flex items-center gap-2 mx-auto"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M22.25 12.88c-.02-3.26.09-3.97 1.43-5.57l.57-.69c.3-.38.48-.86.48-1.38 0-1.19-.96-2.16-2.15-2.16H6.43C4.76 3.08 3.4 4.44 3.4 6.1v24.55c0 1.66 1.36 3.02 3.02 3.02h16.02c1.19 0 2.15-.97 2.15-2.16 0-.52-.18-1-.48-1.38l-.57-.69c-2.11-2.55-2.41-3.32-2.41-6.45v-.11z" />
            </svg>
            Chrome Web Store
          </a>
          <a
            href="#"
            className="bg-noke-card text-white font-semibold px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition text-sm flex items-center gap-2 mx-auto"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M8.26 1.29c-.52.16-1.02.43-1.44.79-.19.17-.37.48-.24.7.08.13.2.2.35.2.14 0 .33-.12.46-.17.82-.37 1.72-.51 2.6-.43h1.34l.02.01c.76.07 1.49.29 2.15.64.19.1.4.23.6.36l.32.21c.02.02.05.04.07.07.3.27.58.57.82.9.08.11.25.2.25.35 0 .15-.12.27-.27.27-.08 0-.17-.04-.22-.07l-.11-.06c-.33-.19-.65-.41-.93-.67l-.06-.05c-.57-.5-1.25-.86-1.99-1.04l-.92-.16h-.74c-.35 0-.7.04-1.04.12z" />
              <path d="M7.05.14c.76.05 1.51.24 2.2.57.13.06.28.14.4.22.07.05.17.11.17.2 0 .09-.11.16-.2.16-.1 0-.18-.06-.23-.1-.15-.14-.31-.27-.48-.38-.76-.46-1.62-.7-2.5-.7-.45 0-.9.06-1.33.18-.15.04-.33.1-.48.18-.07.04-.16.06-.22.06-.12 0-.19-.07-.19-.17 0-.1.07-.16.14-.2.3-.16.63-.25.96-.28.33-.04.66-.01.99.03z" />
            </svg>
            Firefox Add-ons
          </a>
        </div>
      </section>

      <section className="py-10 border-t border-white/5">
        <h2 className="text-2xl font-bold mb-6">
          <span className="text-kick">›</span> Preguntas frecuentes
        </h2>

        <div className="space-y-4">
          <div className="card">
            <h3 className="text-white font-semibold mb-1">¿La extensión consume muchos recursos?</h3>
            <p className="text-noke-muted text-sm">
              No. La extensión es liviana: solo corre un timer cada {tickInterval / 60000} minutos y
              detecta cambios en la página cada 2 segundos. El consumo de CPU
              es prácticamente nulo.
            </p>
          </div>
          <div className="card">
            <h3 className="text-white font-semibold mb-1">¿Qué pasa si cierro el navegador?</h3>
            <p className="text-noke-muted text-sm">
              El contador se pausa. Cuando volvés a abrir Kick y entrás al
              stream, la extensión retoma automáticamente.
            </p>
          </div>
          <div className="card">
            <h3 className="text-white font-semibold mb-1">¿Puedo tener varias pestañas abiertas?</h3>
            <p className="text-noke-muted text-sm">
              Sí, pero solo cuenta una sesión a la vez. Si tenés varias
              pestañas de soynokexd abiertas, la extensión usa la primera que
              detectó.
            </p>
          </div>
          <div className="card">
            <h3 className="text-white font-semibold mb-1">¿Los puntos se guardan si desinstalo la extensión?</h3>
            <p className="text-noke-muted text-sm">
              Sí. Los puntos están asociados a tu cuenta de Kick en el servidor
              de NokePoints, no en el navegador. Podés desinstalar y reinstalar
              cuando quieras sin perder nada.
            </p>
          </div>
          <div className="card">
            <h3 className="text-white font-semibold mb-1">¿Hay límite de puntos por día?</h3>
            <p className="text-noke-muted text-sm">
              No hay límite de watchtime. Podés acumular puntos mientras el
              stream esté en vivo. El bonus de chat tiene un límite de{" "}
              {dailyChatLimit} mensajes por día ({chatBonus * dailyChatLimit} pts extra).
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
