import { useEffect, useRef, useSyncExternalStore } from "react";
import { useMotionValue } from "motion/react";

const query = "(prefers-reduced-motion: reduce)";
function subscribe(callback: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

export function usePrintProgress() {
  const target = useRef<HTMLElement>(null);
  const reducedMotion = useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => true);
  const progress = useMotionValue(0);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const element = target.current;
      if (!element) return;
      const bounds = element.getBoundingClientRect();
      const distance = element.offsetHeight - window.innerHeight;
      progress.set(distance > 0 ? Math.max(0, Math.min(1, -bounds.top / distance)) : 0);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("pageshow", schedule);
    const observer = new ResizeObserver(schedule);
    if (target.current) observer.observe(target.current);
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("pageshow", schedule);
    };
  }, [progress]);
  return { target, progress, reducedMotion };
}