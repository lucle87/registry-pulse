import { PRICE, BASE_URL } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const text = `# Registry Pulse - Company lookup from official open registries

Resolve any business by name or id and get OFFICIAL registration data:
legal name, status, registry id, address, and (where available) directors.
This is registry data for verifying a counterparty, NOT marketing/contact data.
Pay-per-call via MPP on Tempo. No API key, no signup.

## Why this exists
Agents doing KYB, due diligence, or counterparty checks need to confirm a company
legally exists and is active in an official registry. Marketing data providers
(Apollo, Clearbit) answer "who works there", not "is this a real, active legal
entity". Registry Pulse answers the second question from open registry data.

## Coverage (registry-based, not every country)
- GLOBAL: GLEIF LEI. Any legal entity with an LEI, worldwide. Lookup by LEI or name.
- GB: UK Companies House. Lookup by company number or name. Returns directors.
- US: SEC EDGAR. SEC filers (mostly public companies). Lookup by CIK or name.

## When to use this
- Verify a company legally exists and is active before transacting
- Resolve a name to an official registry id (LEI / CIK / company number)
- Pull directors of a UK company
- KYB / due diligence / counterparty checks for an agent

## Endpoint
POST ${BASE_URL}/api/company   (price: ${PRICE} USD per call, paid via MPP on Tempo)

Request body (JSON):
{ "query": "Apple Inc", "country": "US", "type": "name" }
  - query   : company name OR an id (LEI / company number / CIK)
  - country : GLOBAL (default) | GB | US
  - type    : "id" | "name"   (omit to auto-detect)

Examples:
{ "query": "5493001KJTIIGC8Y1R12" }                 // LEI -> GLOBAL/GLEIF
{ "query": "Apple", "country": "US", "type": "name" }
{ "query": "00445790", "country": "GB", "type": "id" }

Response (200, JSON):
{
  "type": "company",
  "source": "GLEIF | UK_COMPANIES_HOUSE | US_SEC_EDGAR",
  "country": "GLOBAL | GB | US",
  "query": "...",
  "matchedBy": "id | name",
  "count": 1,
  "results": [
    {
      "name": "...",
      "status": "...",
      "jurisdiction": "...",
      "registryId": "...",
      "idType": "LEI | CRN | CIK",
      "address": "...",
      "directors": ["..."],
      "registryUrl": "..."
    }
  ],
  "disclaimer": "..."
}

## Payment
Unpaid requests return HTTP 402 with a WWW-Authenticate: Payment challenge
(method="tempo", intent="charge"). Pay with mppx, then retry.
Use: npx mppx ${BASE_URL}/api/company --method POST -J '{"query":"Apple Inc","country":"US"}'

## Notes
- Data from official open registries (GLEIF, UK Companies House, SEC EDGAR). Informational only.
- Coverage is registry-by-registry, not universal. Unsupported country returns a clear note.
- Discovery document: ${BASE_URL}/openapi.json
`;
  return new Response(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
