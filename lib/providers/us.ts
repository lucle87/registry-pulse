// US SEC EDGAR - free, khong key, nhung SEC bat buoc User-Agent co email lien he.
// Chi phu cong ty co nop ho so SEC (chu yeu cong ty dai chung).
// Name -> CIK qua company_tickers.json (cache trong RAM). CIK -> submissions API.

import { getJson } from "../http";
import type { CompanyResult, LookupMode, Provider, ProviderOut } from "../registry";

const CIK_RE = /^\d{1,10}$/;

let tickerCache: any[] | null = null;
let tickerCacheAt = 0;

function ua(): string {
  const email = process.env.CONTACT_EMAIL || "contact@example.com";
  return `RegistryPulse/1.0 (${email})`;
}

function pad10(cik: string | number): string {
  return String(cik).replace(/\D/g, "").padStart(10, "0");
}

function edgarAddr(addresses: any): string | undefined {
  if (!addresses) return undefined;
  const a = addresses.business || addresses.mailing || addresses;
  return (
    [a.street1, a.street2, a.city, a.stateOrCountry, a.zipCode]
      .filter(Boolean)
      .join(", ") || undefined
  );
}

async function loadTickers(): Promise<any[]> {
  const now = Date.now();
  if (tickerCache && now - tickerCacheAt < 6 * 3600 * 1000) return tickerCache;
  const data = await getJson(
    "https://www.sec.gov/files/company_tickers.json",
    { "User-Agent": ua() },
    12000
  );
  tickerCache = data ? Object.values(data) : [];
  tickerCacheAt = now;
  return tickerCache;
}

async function byCik(cik: string): Promise<CompanyResult | null> {
  const padded = pad10(cik);
  const d = await getJson(
    `https://data.sec.gov/submissions/CIK${padded}.json`,
    { "User-Agent": ua() },
    12000
  );
  if (!d) return null;
  return {
    name: d.name,
    status: "REGISTERED",
    jurisdiction: d.addresses?.business?.stateOrCountry || "US",
    registryId: String(Number(padded)),
    idType: "CIK",
    address: edgarAddr(d.addresses),
    legalForm: d.entityType,
    ticker: Array.isArray(d.tickers) && d.tickers.length ? d.tickers[0] : undefined,
    registryUrl: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${padded}&type=&dateb=&owner=include&count=40`,
  };
}

export const us: Provider = {
  code: "US",
  source: "US_SEC_EDGAR",
  supportsName: true,
  supportsId: true,
  async lookup(query: string, mode: LookupMode): Promise<ProviderOut> {
    const q = query.trim();
    const byId = mode === "id" || (mode !== "name" && CIK_RE.test(q));

    if (byId) {
      try {
        const r = await byCik(q);
        return { matchedBy: "id", results: r ? [r] : [] };
      } catch {
        return {
          matchedBy: "id",
          results: [],
          note: "No SEC filer for that CIK.",
        };
      }
    }

    // Name search nhe: tra thang tu danh sach ticker, khong fetch tung submission.
    const list = await loadTickers();
    const ql = q.toLowerCase();
    const hits = list
      .filter((x: any) => String(x.title || "").toLowerCase().includes(ql))
      .slice(0, 5)
      .map((h: any) => {
        const padded = pad10(h.cik_str);
        return {
          name: h.title,
          status: "REGISTERED",
          jurisdiction: "US",
          registryId: String(h.cik_str),
          idType: "CIK",
          ticker: h.ticker,
          registryUrl: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${padded}&type=&dateb=&owner=include&count=40`,
        } as CompanyResult;
      });

    return {
      matchedBy: "name",
      results: hits,
      note: hits.length
        ? "Name results are lightweight. Look up by CIK for full detail. EDGAR covers SEC filers (mostly public companies)."
        : "No SEC-registered company matched. EDGAR only covers companies that file with the SEC.",
    };
  },
};
