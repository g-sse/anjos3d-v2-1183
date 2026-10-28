import { useState } from "react";
import { useMotionValueEvent } from "motion/react";
import { ArrowDown } from "lucide-react";
import { usePrintProgress } from "../hooks/use-print-progress";
import { PrintScene } from "./print-scene";
import { TextLines, useSiteContent } from "./site-content";

export function ScrollHero() {
  const { texts: t } = useSiteContent();
  const { target, progress } = usePrintProgress();
  const [value, setValue] = useState(progress.get());
  useMotionValueEvent(progress, "change", setValue);
  const p = value;
  const stage = p < 0.24 ? t.heroStage1 : p < 0.68 ? t.heroStage2 : p < 0.94 ? t.heroStage3 : t.heroStage4;
  return (
    <section className="quiet-hero" ref={target} id="inicio" aria-label="Introdução Anjos3D — impressão construída pelo scroll" data-progress={p.toFixed(4)}>
      <div className="quiet-hero-sticky">
        <div className="quiet-hero-layout">
          <div className="quiet-hero-copy">
            <div className="quiet-eyebrow"><span className="signal-dot" /> {t.heroEyebrow} <span>{t.heroIndex}</span></div>
            <h1>{t.heroTitle1}<br />{t.heroTitle2}<span>{t.heroPunctuation}</span></h1>
            <p className="quiet-hero-description"><TextLines text={t.heroDescription} /></p>
            <h2 className="hero-layer-subtitle">{t.heroSubtitle1} <em>{t.heroSubtitle2}</em> {t.heroSubtitle3}<span>{t.heroSubtitlePunctuation}</span></h2>
            <a href={t.heroLink} className="quiet-catalog-link" aria-label={t.heroButton}>{t.heroButton} <ArrowDown size={16} /></a>
          </div>
          <div className="quiet-hero-visual">
            <PrintScene progress={progress} reducedMotion={false} />
            <div className="quiet-telemetry" aria-hidden="true">
              <span><i /> {stage}</span><strong>{String(Math.round(p * 100)).padStart(3, "0")}<small>%</small></strong>
              <span className="quiet-caption">{t.heroCaption}<br /><b>{t.heroIllustration}</b></span>
            </div>
          </div>
        </div>
        <div className="quiet-hero-bottom"><span>{t.heroBottom1}</span><span>{t.heroScroll} <ArrowDown size={12} /></span><span>{t.heroBottom2}</span></div>
        <div className="quiet-progress" aria-hidden="true"><span style={{ width: `${p * 100}%` }} /></div>
      </div>
    </section>
  );
}