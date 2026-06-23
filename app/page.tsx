import { PRICE, BASE_URL } from "@/lib/config";
import { SUPPORTED_COUNTRIES } from "@/lib/registry";

export default function Home() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px" }}>
      <h1 style={{ fontSize: 28, marginBottom: 6 }}>Registry Pulse</h1>
      <p style={{ color: "#8a8fa0", marginTop: 0 }}>
        Company lookup from official open registries. Resolve a business by name or id and get
        legal name, status, registry id, address, and directors. Pay-per-call via MPP on Tempo.
        No API key, no signup.
      </p>

      <div style={{ background: "#14171f", border: "1px solid #232733", borderRadius: 14, padding: 20, marginTop: 24 }}>
        <h2 style={{ fontSize: 16, marginTop: 0 }}>For agents</h2>
        <p style={{ color: "#8a8fa0", fontSize: 14 }}>
          Discovery: <a href="/openapi.json" style={{ color: "#8b7cf6" }}>{BASE_URL}/openapi.json</a>
          {"  ·  "}
          <a href="/llms.txt" style={{ color: "#8b7cf6" }}>/llms.txt</a>
        </p>
        <pre style={{ background: "#0b0d12", border: "1px solid #232733", borderRadius: 10, padding: 14, overflowX: "auto", fontSize: 13 }}>{`POST ${BASE_URL}/api/company
Content-Type: application/json

{ "query": "Apple Inc", "country": "US", "type": "name" }

Price: ${PRICE} USD per call (paid via MPP on Tempo)`}</pre>
      </div>

      <div style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 16 }}>Coverage</h2>
        <ul style={{ color: "#8a8fa0", fontSize: 14, lineHeight: 1.7, paddingLeft: 18 }}>
          {SUPPORTED_COUNTRIES.map((c) => (
            <li key={c.code}>
              <b style={{ color: "#e8eaf0" }}>{c.code}</b> {c.source} ({c.by.join(", ")})
            </li>
          ))}
        </ul>
      </div>

      <p style={{ color: "#8a8fa0", fontSize: 13, marginTop: 24 }}>
        Official registration data for verifying a counterparty, not marketing data. Coverage is
        registry-by-registry, not every country.
      </p>
    </main>
  );
}
