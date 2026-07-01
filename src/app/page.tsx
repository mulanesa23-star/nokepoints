import Link from "next/link";
import { getPointsConfig } from "@/lib/points";

export const dynamic = "force-dynamic";

async function getConfig() {
  try {
    return await getPointsConfig();
  } catch {
    return null;
  }
}

export default async function Home() {
  const cfg = await getConfig();
  const ptsPerTick = cfg?.POINTS_PER_TICK ?? 100;
  const subMultiplier = cfg?.SUBSCRIBER_MULTIPLIER ?? 2;
  const chatBonus = cfg?.CHAT_BONUS_PER_MSG ?? 10;

  return (
    <>
      <section className="relative flex flex-col items-center text-center py-16 md:py-24 overflow-hidden">
        <div
          className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 opacity-[0.07]"
          style={{
            backgroundImage: "url(/KICK_FRAMEGREEN.svg)",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 opacity-[0.04]"
          style={{
            backgroundImage: "url(/KICK_FRAMEBLACK.png)",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
          }}
        />

        <div className="inline-flex items-center gap-2 bg-kick/10 text-kick text-xs font-semibold px-4 py-1.5 rounded-full mb-6 border border-kick/20">
          <img src="/kick-green.svg" alt="" className="w-4 h-4" />
          KICK / NOKEPOINTS
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight relative">
          Mirá el stream, sumá puntos
          <br />
          y canjeálos por{" "}
          <span className="gradient-text">premios reales</span>.
        </h1>

        <p className="text-noke-muted text-base md:text-lg mt-6 max-w-xl relative">
          Una plataforma de <strong className="text-white">recompensas</strong>{" "}
          para la comunidad de{" "}
          <strong className="text-white">soynokexd</strong>. Acumulás puntos
          viendo el stream y los gastás en premios y sorteos exclusivos.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-10 relative">
          <Link
            href="/api/auth/kick-start"
            className="bg-kick text-black font-bold px-8 py-3 rounded-xl text-base hover:bg-kick-dark transition glow flex items-center gap-2"
          >
            <img src="/kick-black.svg" alt="" className="w-4 h-4" />
            Conectar con Kick
          </Link>
          <Link
            href="/extension"
            className="bg-noke-card text-white font-semibold px-8 py-3 rounded-xl text-base border border-white/10 hover:bg-white/5 transition"
          >
            Saber más
          </Link>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          <span className="text-kick">›</span> Qué es NokePoints
        </h2>
        <p className="text-noke-muted max-w-2xl">
          Una plataforma de recompensas para la comunidad de soynokexd. Acumulás
          puntos viendo el stream y los gastás en premios físicos, sorteos
          exclusivos y más.
        </p>
      </section>

      <section className="py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-8">
          <span className="text-kick">›</span> Qué podés hacer
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <img src="/KICK_FRAMEGREEN.svg" alt="" className="w-8 h-8" />
              <span className="text-kick text-3xl font-bold">01</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Watchtime automático</h3>
            <p className="text-noke-muted text-sm">
              Cada {cfg?.TICK_INTERVAL_MS ? `${cfg.TICK_INTERVAL_MS / 60000} min` : "rato"} ganás{" "}
              <strong className="text-white">{ptsPerTick} pts</strong> solo por
              tener el stream abierto. La extensión se encarga de todo
              automáticamente.
            </p>
          </div>
          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <img src="/KICK_FRAMEGREEN.svg" alt="" className="w-8 h-8" />
              <span className="text-kick text-3xl font-bold">02</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Bonus por chatear</h3>
            <p className="text-noke-muted text-sm">
              Participá en el chat y sumá <strong className="text-white">
              {chatBonus} pts extra</strong> por cada mensaje. Hay límite
              diario &mdash; no spamees.
            </p>
          </div>
          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <img src="/KICK_FRAMEGREEN.svg" alt="" className="w-8 h-8" />
              <span className="text-kick text-3xl font-bold">03</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Bonus para subs</h3>
            <p className="text-noke-muted text-sm">
              Si estás suscripto al canal en Kick, ganás{" "}
              <strong className="text-white">
                {ptsPerTick * subMultiplier} pts
              </strong>{" "}
              por tick en vez de {ptsPerTick}. El bonus se aplica
              automáticamente.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 border-t border-white/5">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Empezá con la extensión
          </h2>
          <p className="text-noke-muted mb-8 max-w-md mx-auto">
            Una vez instalada, cuenta automáticamente cuánto tiempo mirás el
            stream y te suma {ptsPerTick} puntos cada{" "}
            {cfg?.TICK_INTERVAL_MS ? `${cfg.TICK_INTERVAL_MS / 60000} min` : "2 min"}.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="#"
              className="bg-noke-card text-white font-semibold px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition text-sm flex items-center gap-2 mx-auto"
            >
              <img src="/kick-green.svg" alt="" className="w-4 h-4" />
              Chrome Web Store
            </a>
            <a
              href="#"
              className="bg-noke-card text-white font-semibold px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition text-sm flex items-center gap-2 mx-auto"
            >
              <img src="/kick-green.svg" alt="" className="w-4 h-4" />
              Firefox Add-ons
            </a>
          </div>

          <p className="text-noke-muted text-xs mt-4">
            ›{" "}
            {cfg?.TICK_INTERVAL_MS ? `${cfg.TICK_INTERVAL_MS / 60000} min mirando` : "Cada 2 min"} ={" "}
            {ptsPerTick} pts &middot; canal: soynokexd
          </p>
          <Link
            href="/extension"
            className="inline-block text-kick text-xs hover:underline mt-3"
          >
            Ver explicación completa →
          </Link>
        </div>
      </section>

      <footer className="py-8 border-t border-white/5 text-center text-noke-muted text-xs">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-4">
          <Link href="/" className="hover:text-white transition">
            Inicio
          </Link>
          <Link href="/extension" className="hover:text-white transition">
            Extensión
          </Link>
          <Link href="/rewards" className="hover:text-white transition">
            Tienda
          </Link>
          <Link href="/dashboard" className="hover:text-white transition">
            Dashboard
          </Link>
          <Link href="/leaderboard" className="hover:text-white transition">
            Leaderboard
          </Link>
        </div>
        <div className="flex items-center justify-center gap-2 mb-3">
          <img src="/kick-green.svg" alt="" className="w-4 h-4" />
          <span className="text-noke-muted">Impulsado por Kick</span>
        </div>
        <p>
          NokePoints &copy; {new Date().getFullYear()} &mdash; Hecho para la
          comunidad de soynokexd
        </p>
      </footer>
    </>
  );
}
