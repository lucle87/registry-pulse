// GET /openapi.json - discovery document chuan mppscan.

import { PRICE, RECIPIENT_ADDRESS, BASE_URL, CONTACT_EMAIL } from "@/lib/config";
import { SUPPORTED_COUNTRIES } from "@/lib/registry";

export const dynamic = "force-dynamic";

export async function GET() {
  const doc = {
    openapi: "3.1.0",
    info: {
      title: "Registry Pulse",
      version: "1.0.0",
      description:
        "Company lookup from official open registries. Resolve any business by name or id and get legal name, status, registry id, address, and (where available) directors. Global coverage via GLEIF LEI, plus UK Companies House and US SEC EDGAR. Not marketing data, this is official registration data for verifying a counterparty. Pay-per-call via MPP on Tempo. No API key, no signup.",
      "x-guidance":
        "Use Registry Pulse WHEN you need to verify or look up a company from an OFFICIAL registry (legal existence, status, registry id, directors), not marketing/contact data. Body: { query, country?, type? }. country one of GLOBAL (GLEIF LEI, default), GB (UK Companies House), US (SEC EDGAR). type 'id' or 'name' (omit to auto-detect). Coverage is registry-based, not every country. Unpaid requests return HTTP 402 with a Tempo payment challenge; pay with mppx and retry. Full agent docs at /llms.txt.",
      contact: {
        name: "Registry Pulse",
        email: CONTACT_EMAIL,
        url: BASE_URL,
      },
    },
    servers: [{ url: BASE_URL }],
    "x-docs": { llmsTxt: BASE_URL + "/llms.txt" },
    "x-discovery": { ownershipProofs: [RECIPIENT_ADDRESS] },
    "x-coverage": SUPPORTED_COUNTRIES,
    paths: {
      "/api/company": {
        post: {
          operationId: "lookupCompany",
          summary: "Company registry lookup by name or id (GLEIF, UK, US)",
          tags: ["data", "company", "registry", "kyb", "lei", "verification"],
          "x-payment-info": {
            price: { mode: "fixed", amount: PRICE, currency: "USD" },
            protocols: [{ mpp: {} }],
          },
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    query: {
                      type: "string",
                      description:
                        "Company name, or an id (LEI / UK company number / US CIK).",
                    },
                    country: {
                      type: "string",
                      enum: ["GLOBAL", "GB", "US"],
                      description:
                        "Registry to use. GLOBAL = GLEIF LEI (default). Omit for GLOBAL.",
                    },
                    type: {
                      type: "string",
                      enum: ["id", "name"],
                      description: "Lookup mode. Omit to auto-detect.",
                    },
                  },
                  required: ["query"],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Company registry data.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      type: { type: "string" },
                      source: { type: "string" },
                      country: { type: "string" },
                      query: { type: "string" },
                      matchedBy: { type: "string" },
                      count: { type: "integer" },
                      results: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            status: { type: "string" },
                            jurisdiction: { type: "string" },
                            registryId: { type: "string" },
                            idType: { type: "string" },
                            address: { type: "string" },
                            incorporationDate: { type: "string" },
                            legalForm: { type: "string" },
                            ticker: { type: "string" },
                            directors: {
                              type: "array",
                              items: { type: "string" },
                            },
                            registryUrl: { type: "string" },
                          },
                        },
                      },
                      note: { type: "string" },
                      disclaimer: { type: "string" },
                    },
                    required: ["type", "source", "country", "query", "results"],
                  },
                },
              },
            },
            "400": { description: "Bad Request - missing query." },
            "402": { description: "Payment Required" },
          },
        },
      },
    },
  };

  return Response.json(doc, { headers: { "Cache-Control": "no-store" } });
}
