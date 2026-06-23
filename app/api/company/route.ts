// Endpoint tra cuu cong ty tu cac registry mo, gate bang MPP.
// THU TU: doi tien (402) TRUOC, validate query SAU (tranh loi probe an 400).

import { NextRequest } from "next/server";
import { Mppx, tempo } from "mppx/server";
import {
  IS_TESTNET,
  PAY_TOKEN,
  PRICE_AMOUNT,
  RECIPIENT_ADDRESS,
  MPP_SECRET_KEY,
  REALM_HOST,
} from "@/lib/config";
import { lookupCompany } from "@/lib/registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const mppx = Mppx.create({
  methods: [
    tempo({
      currency: PAY_TOKEN,
      recipient: RECIPIENT_ADDRESS,
      testnet: IS_TESTNET,
    }),
  ],
  secretKey: MPP_SECRET_KEY,
  realm: REALM_HOST,
});

type Input = { query: string; country?: string; type?: string };

async function readInput(request: NextRequest): Promise<Input> {
  try {
    const body = await request.clone().json();
    return {
      query: (body?.query || "").toString().trim(),
      country: body?.country ? body.country.toString().trim() : undefined,
      type: body?.type ? body.type.toString().trim() : undefined,
    };
  } catch {
    return { query: "" };
  }
}

async function build(input: Input) {
  return await lookupCompany(input.query, input.country, input.type);
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url);

  // ===== Preview (test, bo qua thanh toan) =====
  const previewKey = url.searchParams.get("preview");
  const PREVIEW_KEY = process.env.PREVIEW_KEY;
  const isPreview = Boolean(PREVIEW_KEY) && previewKey === PREVIEW_KEY;

  if (isPreview) {
    const input = await readInput(request);
    if (!input.query) {
      return Response.json(
        { error: "Missing 'query'. Provide a company name or id." },
        { status: 400 }
      );
    }
    try {
      const data = await build(input);
      return Response.json({ _preview: true, ...data });
    } catch (err: any) {
      return Response.json({ error: err?.message || "failed" }, { status: 502 });
    }
  }

  // ===== MPP: thu phi TRUOC (ep host = domain chinh de realm dung) =====
  let reqForMpp: Request = request;
  try {
    const fixedUrl = new URL(request.url);
    fixedUrl.host = REALM_HOST;
    fixedUrl.protocol = "https:";
    const headers = new Headers(request.headers);
    headers.set("host", REALM_HOST);
    headers.set("x-forwarded-host", REALM_HOST);
    reqForMpp = new Request(fixedUrl.toString(), {
      method: request.method,
      headers,
      body: await request.clone().arrayBuffer(),
    });
  } catch {
    reqForMpp = request;
  }

  const paid = await mppx.tempo.charge({
    amount: PRICE_AMOUNT,
    recipient: RECIPIENT_ADDRESS,
  })(reqForMpp);

  // Chua tra -> tra challenge 402 ngay, chua can dung toi query.
  if (paid.status === 402) {
    return paid.challenge;
  }

  // ===== Da tra tien roi moi validate va goi registry =====
  const input = await readInput(request);
  if (!input.query) {
    return Response.json(
      { error: "Missing 'query'. Provide a company name or id." },
      { status: 400 }
    );
  }

  try {
    const data = await build(input);
    return paid.withReceipt(Response.json(data));
  } catch (err: any) {
    return Response.json(
      { error: "Lookup failed: " + (err?.message || "unknown") },
      { status: 502 }
    );
  }
}
