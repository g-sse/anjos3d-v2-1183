import { useEffect, useRef, useState } from "react";
import type { MotionValue } from "motion/react";

type Props = { progress: MotionValue<number>; reducedMotion: boolean };
const frameUrl = (frame: number) => `/images/hero-sequence/frame-${String(frame).padStart(3, "0")}.webp`;

/** Pre-rendered sequence: no WebGL, idle render loop, or browser GPU dependency. */
export function PrintScene({ progress, reducedMotion }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const [status, setStatus] = useState("loading");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let disposed = false;
    let scheduled = 0;
    let shown = -1;
    let desired = reducedMotion ? 64 : Math.round(progress.get() * 64);
    const cache = new Map<number, HTMLImageElement>();
    const pending = new Set<number>();
    const failed = new Set<number>();
    let context: CanvasRenderingContext2D | null = null;
    try { context = canvas.current?.getContext("2d", { alpha: false }) ?? null; } catch { /* image fallback */ }
    const draw = () => {
      scheduled = 0;
      if (disposed || !cache.size) return;
      const nearest = [...cache.keys()].sort((a, b) => Math.abs(a - desired) - Math.abs(b - desired))[0];
      if (shown === nearest) return;
      const loaded = cache.get(nearest)!;
      shown = nearest;
      if (context) context.drawImage(loaded, 0, 0, 800, 680);
      else if (image.current) image.current.src = loaded.src;
      if (canvas.current) canvas.current.dataset.frame = String(nearest);
      if (image.current) image.current.dataset.frame = String(nearest);
      setStatus(failed.has(desired) ? "error" : context ? "ready" : "image-fallback");
    };
    const schedule = () => { if (!scheduled && !disposed) scheduled = requestAnimationFrame(draw); };
    const load = (index: number) => {
      if (index < 0 || index > 64 || cache.has(index) || pending.has(index) || failed.has(index)) return;
      pending.add(index);
      const asset = new Image();
      asset.onload = () => {
        if (disposed) return;
        pending.delete(index);
        cache.set(index, asset);
        // Bound decoded memory to 16 frames (~35 MB); distant frames remain in HTTP cache.
        while (cache.size > 16) {
          const farthest = [...cache.keys()].sort((a, b) => Math.abs(b - desired) - Math.abs(a - desired))[0];
          cache.delete(farthest);
        }
        schedule();
      };
      asset.onerror = () => {
        if (disposed) return;
        pending.delete(index);
        failed.add(index);
        if (index === desired || !cache.size) setStatus("error");
      };
      asset.src = frameUrl(index);
    };
    const update = () => {
      desired = reducedMotion ? 64 : Math.round(Math.max(0, Math.min(1, progress.get())) * 64);
      if (failed.has(desired)) setStatus("error");
      load(desired);
      for (let offset = 1; offset <= 3; offset++) { load(desired + offset); load(desired - offset); }
      schedule();
    };
    setStatus("loading");
    update();
    if (!reducedMotion) [0, 16, 32, 48, 64].forEach(load);
    const unsubscribe = progress.on("change", update);
    return () => { disposed = true; cancelAnimationFrame(scheduled); unsubscribe(); cache.clear(); };
  }, [progress, reducedMotion, retry]);
  return (
    <div className="sequence-scene" data-scene-status={reducedMotion && status !== "error" ? "reduced-motion" : status}>
      <img ref={image} className={`sequence-image${status === "image-fallback" ? " visible" : ""}`} src={frameUrl(reducedMotion ? 64 : 0)} alt="Visualização ilustrativa de uma peça escultórica em camadas sobre uma mesa de impressão 3D" fetchPriority="high" />
      <canvas ref={canvas} width={800} height={680} className={status === "ready" ? "visible" : ""} aria-hidden="true" />
      {status === "loading" && <output className="sequence-notice">Carregando visualização de impressão…</output>}
      {status === "error" && <output className="sequence-notice">Não foi possível carregar as imagens da impressão. <button onClick={() => setRetry(value => value + 1)}>Tentar novamente</button></output>}
    </div>
  );
}