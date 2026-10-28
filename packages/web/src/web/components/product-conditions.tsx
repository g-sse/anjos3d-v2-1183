import { ArrowUpRight } from "lucide-react";
import { useSiteContent } from "./site-content";
import { fillText } from "../../shared/site-content";

type Props = { name: string; priceCents: number | null; resalePriceCents?: number | null; consignmentPriceCents?: number | null; partner: boolean; loading: boolean; error: boolean; whatsapp: string; quantity: number };
const money = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export function ProductConditions(props: Props) {
  const { texts: t } = useSiteContent();
  const negotiate = (condition: string, volume = false) => {
    const message = fillText(t.priceMessage, { produto: props.name, modalidade: condition, volume: volume ? fillText(t.priceVolumeMessage, { quantidade: props.quantity }) : "" });
    return props.whatsapp ? `https://wa.me/${props.whatsapp}?text=${encodeURIComponent(message)}` : "#contato";
  };
  return (
    <div className="product-conditions">
      <div className="condition-row"><span>{t.priceRetail}</span>{props.priceCents === null ? <a href={negotiate("varejo")} target={props.whatsapp ? "_blank" : undefined} rel="noreferrer">{t.priceNegotiate} <ArrowUpRight size={12} /></a> : <strong>{money(props.priceCents)}</strong>}</div>
      {props.partner && props.loading && <p className="conditions-note">Carregando condições de parceiro…</p>}
      {props.partner && props.error && <p className="conditions-note">Não foi possível verificar os preços de parceiro. Entre novamente ou fale com a Anjos3D.</p>}
      {[{ label: t.priceResale, condition: "revenda", value: props.resalePriceCents }, { label: t.priceConsignment, condition: "consignação", value: props.consignmentPriceCents }].map(row => (
        <div className="condition-row" key={row.condition}>
          <span>{row.label}</span>
          <div>
            {props.partner && !props.loading && !props.error && row.value != null ? <><strong>{money(row.value)}</strong><a className="volume-link" href={negotiate(row.condition, true)} target={props.whatsapp ? "_blank" : undefined} rel="noreferrer">{fillText(t.priceVolume, { quantidade: props.quantity })} <ArrowUpRight size={12} /></a></> : <a href={negotiate(row.condition)} target={props.whatsapp ? "_blank" : undefined} rel="noreferrer">{t.priceNegotiate} <ArrowUpRight size={12} /></a>}
          </div>
        </div>
      ))}
      {!props.partner && <a className="partner-invitation" href="/entrar">{t.partnerInvitation} <ArrowUpRight size={13} /></a>}
    </div>
  );
}