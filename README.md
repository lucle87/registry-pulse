# Registry Pulse - Company lookup from official open registries (MPP service)

Agent gui ten hoac id cong ty -> server tra cuu tu registry chinh thuc mo ->
tra ve du lieu dang ky (ten phap ly, status, registry id, dia chi, directors).
Tra phi per-call qua MPP tren Tempo (USDC.e). KHONG doc on-chain, KHONG ban lai
API marketing dat tien. Nguon la registry mo.

## Vi sao lam cai nay
StableEnrich va dong reseller ban lai Apollo/Clearbit (data marketing, "ai lam o do").
Ngach nay khac: data DANG KY CHINH THUC (cong ty co that, con hoat dong khong, ai la
giam doc) tu nguon mo, free. Khong von, khong vuong ToS ban lai. Phu toan cau o muc
registry co the lam duoc, nuoc nao khong co nguon mo thi khong nhan.

## Coverage (theo registry, khong phai moi nuoc)
- GLOBAL: GLEIF LEI. Free hoan toan, khong key. Tra theo LEI hoac ten.
- GB: UK Companies House. CAN API key free. Tra theo company number hoac ten. Co directors.
- US: SEC EDGAR. Free, khong key, nhung can User-Agent co email (CONTACT_EMAIL).
       Chi phu cong ty nop ho so SEC (chu yeu dai chung). Tra theo CIK hoac ten.

## Endpoint
POST /api/company
body: { "query": "...", "country"?: "GLOBAL|GB|US", "type"?: "id|name" }
- country de trong = GLOBAL (GLEIF).
- type de trong = tu doan (id neu trong giong LEI/CIK, con lai name).

## Them nuoc moi sau nay
Chi la viet them 1 file trong lib/providers/<nuoc>.ts theo cung interface Provider,
roi dang ky vao PROVIDERS trong lib/registry.ts. Khong dung toi phan MPP hay route.

## Chay local
```
npm install
copy .env.example .env   (dien RECIPIENT ca 2 dong, CONTACT_EMAIL, PREVIEW_KEY)
npm run dev
```
Kiem tra: /openapi.json, /llms.txt, trang chu.

## Test khong can tra tien (preview)
Them PREVIEW_KEY vao .env, restart, roi dung PowerShell ($body de khoi nuot JSON):
```
$body = '{"query":"Apple Inc","country":"US","type":"name"}'
Invoke-RestMethod -Uri "http://localhost:3000/api/company?preview=KEY" -Method Post -ContentType "application/json" -Body $body | ConvertTo-Json -Depth 8
```
XOA PREVIEW_KEY tren production.

## Deploy + dang ky (giong cac service truoc)
1. Push GitHub -> import Vercel -> ENV: RECIPIENT ca 2 dong, TEMPO_NETWORK=mainnet,
   PAY_TOKEN (USDC.e), BASE_URL = domain chinh (khong dau / cuoi), MPP_SECRET_KEY,
   CONTACT_EMAIL, COMPANIES_HOUSE_API_KEY (neu muon UK), KHONG dat PREVIEW_KEY.
2. Redeploy bo tick build cache de realm = domain chinh.
3. Validate: npx -y agentcash check "https://<domain>/api/company"
4. Dang ky: mppscan.com/register.

## Luu y thang than
- GLEIF free that, khong key. UK can key free. EDGAR can email trong CONTACT_EMAIL.
- Nhu cau data phap ly nho hon enrichment. Doi lai: free, khong rui ro ToS, co hao luy.
- Coverage khong deu - dung quang cao "moi cong ty moi nuoc".
- realm da ep = domain chinh. PAY_TOKEN = USDC.e de agent tra duoc.
