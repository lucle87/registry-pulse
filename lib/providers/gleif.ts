// GLEIF LEI - dinh danh phap nhan toan cau, mo hoan toan (free, khong key).
// Doc: https://api.gleif.org/api/v1/lei-records

import { getJson } from "../http";
import type { CompanyResult, LookupMode, Provider, ProviderOut } from "../registry";

const LEI_RE = /^[A-Z0-9]{18}[0-9]{2}$/i;

function fmtAddr(a: any): string | undefined {
  if (!a) return undefined;
  const parts = [
    ...(Array.isArray(a.addressLines) ? a.addressLines : []),
    a.city,
    a.region,
    a.postalCode,
    a.country,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : undefined;
}

function mapRecord(rec: any): CompanyResult {
  const at = rec?.attributes || {};
  const ent = at.entity || {};
  const lei = at.lei || rec?.id;
  return {
    name: ent.legalName?.name || "(unknown)",
    status: ent.status || at.registration?.status,
    jurisdiction: ent.legalAddress?.country || ent.jurisdiction,
    registryId: lei,
    idType: "LEI",
    address: fmtAddr(ent.legalAddress),
    legalForm: ent.legalForm?.id,
    registryUrl: lei ? `https://search.gleif.org/#/record/${lei}` : undefined,
  };
}

export const gleif: Provider = {
  code: "GLOBAL",
  source: "GLEIF",
  supportsName: true,
  supportsId: true,
  async lookup(query: string, mode: LookupMode): Promise<ProviderOut> {
    const q = query.trim();
    const byId = mode === "id" || (mode !== "name" && LEI_RE.test(q));

    if (byId) {
      try {
        const data = await getJson(
          `https://api.gleif.org/api/v1/lei-records/${encodeURIComponent(q.toUpperCase())}`
        );
        const rec = data?.data;
        return { matchedBy: "id", results: rec ? [mapRecord(rec)] : [] };
      } catch {
        return {
          matchedBy: "id",
          results: [],
          note: "No GLEIF record for that LEI.",
        };
      }
    }

    const url =
      `https://api.gleif.org/api/v1/lei-records?filter[entity.legalName]=` +
      encodeURIComponent(q) +
      `&page[size]=5`;
    const data = await getJson(url);
    const recs = Array.isArray(data?.data) ? data.data : [];
    return {
      matchedBy: "name",
      results: recs.map(mapRecord),
      note: recs.length ? undefined : "No GLEIF legal entity matched that name.",
    };
  },
};
