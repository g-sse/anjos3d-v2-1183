import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { defaultDocument } from "../../shared/site-content";
import type { SiteDocument } from "../../shared/site-content";

const ContentContext = createContext(defaultDocument);
export function SiteContentProvider({ document, children }: { document: SiteDocument; children: ReactNode }) {
  return <ContentContext.Provider value={document}>{children}</ContentContext.Provider>;
}
export function useSiteContent() { return useContext(ContentContext); }
export function TextLines({ text }: { text: string }) {
  return <>{text.split("\n").map((line, i) => <span key={i}>{i > 0 && <br />}{line}</span>)}</>;
}