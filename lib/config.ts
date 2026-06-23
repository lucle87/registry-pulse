// Cau hinh server Registry Pulse. Service tra phi qua MPP tren Tempo (USDC.e),
// nhung data lay tu cac registry mo (GLEIF/UK/US), khong doc on-chain.

export type NetworkName = "mainnet" | "testnet";

export const NETWORK: NetworkName =
  (process.env.TEMPO_NETWORK as NetworkName) || "mainnet";

// Chi can biet testnet hay khong de truyen cho mppx tempo().
export const IS_TESTNET = NETWORK === "testnet";

// Gia moi lan goi. Data phap ly -> dat nhinh hon Tempo Pulse.
export const PRICE = process.env.PULSE_PRICE || "0.050000";
export const PRICE_AMOUNT = process.env.PULSE_PRICE_AMOUNT || "0.05";

// Token nhan tien: USDC.e tren Tempo (default). Token ma agent that (AgentCash,
// Apollo, Poncho) dung de tra. KHONG dung USDT0 thi agent khong tra duoc.
export const PAY_TOKEN = (process.env.PAY_TOKEN ||
  "0x20c000000000000000000000b9537d11c60e8b50") as `0x${string}`;

export const RECIPIENT_ADDRESS = (process.env.NEXT_PUBLIC_RECIPIENT_ADDRESS ||
  process.env.RECIPIENT_ADDRESS ||
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

// Cat moi dau "/" o cuoi de tranh double slash trong llms.txt va openapi.
export const BASE_URL = (process.env.BASE_URL || "http://localhost:3000").replace(
  /\/+$/,
  ""
);

export const REALM_HOST = (() => {
  try {
    return new URL(BASE_URL).host;
  } catch {
    return "localhost:3000";
  }
})();

export const MPP_SECRET_KEY =
  process.env.MPP_SECRET_KEY || "dev-secret-change-me-in-production-please-32b";

export const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "lucle87@example.com";
