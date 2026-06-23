// Bo dinh tuyen: agent gui query + country -> chon dung provider registry.
// Moi quoc gia la mot provider rieng cung interface. Them nuoc = them 1 provider.

import { gleif } from "./providers/gleif";
import { uk } from "./providers/uk";
import { us } from "./providers/us";

export type LookupMode = "id" | "name" | "auto";

export type CompanyResult = {
  name: string;
  status?: string;
  jurisdiction?: string; // ISO country / registry country
  registryId?: string; // ma trong registry do
  idType?: string; // LEI / CRN / CIK
  address?: string;
  incorporationDate?: string;
  legalForm?: string;
  ticker?: string;
  directors?: string[];
  registryUrl?: string;
};

export type ProviderOut = {
  matchedBy: "id" | "name";
  results: CompanyResult[];
  note?: string;
};

export type Provider = {
  code: string; // GLOBAL / GB / US
  source: string; // ten nguon
  supportsName: boolean;
  supportsId: boolean;
  lookup: (query: string, mode: LookupMode) => Promise<ProviderOut>;
};

export type LookupResponse = {
  type: "company";
  source: string;
  country: string;
  query: string;
  matchedBy: "id" | "name";
  count: number;
  results: CompanyResult[];
  note?: string;
  disclaimer: string;
};

const PROVIDERS: Record<string, Provider> = {
  GLOBAL: gleif,
  GLEIF: gleif,
  LEI: gleif,
  GB: uk,
  UK: uk,
  US: us,
  USA: us,
};

// Cho agent biet phu nhung dau.
export const SUPPORTED_COUNTRIES = [
  { code: "GLOBAL", source: "GLEIF LEI", by: ["id (LEI)", "name"] },
  { code: "GB", source: "UK Companies House", by: ["id (company number)", "name"] },
  { code: "US", source: "SEC EDGAR", by: ["id (CIK)", "name"] },
];

export function pickProvider(country?: string): Provider | null {
  const key = (country || "GLOBAL").toUpperCase().trim();
  return PROVIDERS[key] || null;
}

export async function lookupCompany(
  query: string,
  country?: string,
  type?: string
): Promise<LookupResponse> {
  const provider = pickProvider(country);
  if (!provider) {
    throw new Error(
      "Unsupported country '" +
        country +
        "'. Supported: GLOBAL, GB, US."
    );
  }
  const mode: LookupMode =
    type === "id" || type === "name" ? type : "auto";

  const out = await provider.lookup(query.trim(), mode);

  return {
    type: "company",
    source: provider.source,
    country: provider.code,
    query: query.trim(),
    matchedBy: out.matchedBy,
    count: out.results.length,
    results: out.results,
    note: out.note,
    disclaimer:
      "Data from official open company registries. Informational only. Verify against the source registry before relying on it.",
  };
}
