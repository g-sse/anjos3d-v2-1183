import { z } from "zod";

/** Internal path, anchor, https, mailto or tel. Never javascript:/data: or protocol-relative. */
export const safeLink = z.string().max(2048).refine(value => /^(#[\w-]+|\/(?!\/)[\w\-/#?=&.%]*|https:\/\/[^\s"'<>]+|mailto:[^\s"'<>]+|tel:\+?[\d -]+)$/.test(value), "Use um caminho do site, âncora, https://, mailto: ou tel: válido.");

/** Site file (/images/...) or a public media-library upload. */
export const imagePattern = /^\/images\/[\w./-]+$|^\/api\/media\/[\w.-]+$|^https:\/\/[a-z0-9-]+\.t3\.tigrisfiles\.io\/media\/[\w./-]+$/;
export const imageSource = z.string().max(400).regex(imagePattern, "Use uma imagem do site ou da biblioteca de mídia.");
export const optionalImage = z.string().max(400).refine(value => value === "" || imagePattern.test(value), "Use uma imagem do site ou da biblioteca de mídia.");

export const httpsUrl = z.string().max(400).refine(value => value === "" || /^https:\/\/[^\s"'<>]+$/.test(value), "Use um endereço completo começando com https://.");
