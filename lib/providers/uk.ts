// UK Companies House - free nhung can API key (dang ky free).
// Header: Basic base64(API_KEY + ":"). Khong co key -> tra note, khong vo.
// Doc: https://developer.company-information.service.gov.uk

import { getJson } from "../http";
import type { CompanyResult, LookupMode, Provider, ProviderOut } from "../registry";

const BASE = "https://api.company-information.service.gov.uk";
const CRN_RE = /^[A-Z0-9]{6,8}$/i;

function authHeader(): string | null {
  const key = process.env.COMPANIES_HOUSE_API_KEY;
  if (!key) return null;
  const token = Buffer.from(`${key}:`).toString("base64");
  return `Basic ${token}`;
}

function ukAddr(a: any): string | undefined {
  if (!a) return undefined;
  return (
    [
      a.premises,
      a.address_line_1,
      a.address_line_2,
      a.locality,
      a.region,
      a.postal_code,
      a.country,
    ]
      .filter(Boolean)
      .join(", ") || undefined
  );
}

function mapCompany(c: any, directors?: string[]): CompanyResult {
  return {
    name: c.company_name,
    status: c.company_status,
    jurisdiction: "GB",
    registryId: c.company_number,
    idType: "CRN",
    address: ukAddr(c.registered_office_address),
    incorporationDate: c.date_of_creation,
    legalForm: c.type,
    directors,
    registryUrl: `https://find-and-update.company-information.service.gov.uk/company/${c.company_number}`,
  };
}

function mapSearch(it: any): CompanyResult {
  return {
    name: it.title,
    status: it.company_status,
    jurisdiction: "GB",
    registryId: it.company_number,
    idType: "CRN",
    address: it.address_snippet,
    incorporationDate: it.date_of_creation,
    registryUrl: `https://find-and-update.company-information.service.gov.uk/company/${it.company_number}`,
  };
}

export const uk: Provider = {
  code: "GB",
  source: "UK_COMPANIES_HOUSE",
  supportsName: true,
  supportsId: true,
  async lookup(query: string, mode: LookupMode): Promise<ProviderOut> {
    const auth = authHeader();
    if (!auth) {
      return {
        matchedBy: "name",
        results: [],
        note:
          "UK lookup not configured. Set COMPANIES_HOUSE_API_KEY (free key from Companies House).",
      };
    }
    const headers = { Authorization: auth };
    const q = query.trim();
    const byId =
      mode === "id" || (mode !== "name" && CRN_RE.test(q) && /\d/.test(q));

    if (byId) {
      try {
        const c = await getJson(
          `${BASE}/company/${encodeURIComponent(q.toUpperCase())}`,
          headers
        );
        let directors: string[] | undefined;
        try {
          const off = await getJson(
            `${BASE}/company/${encodeURIComponent(q.toUpperCase())}/officers?items_per_page=10`,
            headers
          );
          directors = (off?.items || [])
            .filter((o: any) => !o.resigned_on)
            .map((o: any) => o.name)
            .slice(0, 10);
        } catch {
          // bo qua neu khong lay duoc officers
        }
        return { matchedBy: "id", results: c ? [mapCompany(c, directors)] : [] };
      } catch {
        return {
          matchedBy: "id",
          results: [],
          note: "No UK company for that company number.",
        };
      }
    }

    const s = await getJson(
      `${BASE}/search/companies?q=${encodeURIComponent(q)}&items_per_page=5`,
      headers
    );
    const items = Array.isArray(s?.items) ? s.items : [];
    return {
      matchedBy: "name",
      results: items.map(mapSearch),
      note: items.length ? undefined : "No UK company matched that name.",
    };
  },
};
