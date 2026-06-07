import fetch from "node-fetch";

const FIREFLY_API_KEY = process.env.FIREFLY_API_KEY;
const FIREFLY_ENDPOINT =
  process.env.FIREFLY_ENDPOINT || "https://firefly-api.adobe.io/v1/images";

if (!FIREFLY_API_KEY) {
  console.error("Missing FIREFLY_API_KEY env var");
  process.exit(1);
}

export async function generateImage({ prompt, width = 512, height = 512 }) {
  const body = {
    prompt,
    size: { width, height }
    // Add Firefly-specific options per Adobe docs
  };

  const res = await fetch(FIREFLY_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${FIREFLY_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Firefly error ${res.status}: ${text}`);
  }

  const json = await res.json();
  const base64 = json.imageBase64 || json.data?.[0]?.imageBase64;
  if (!base64) {
    throw new Error("No imageBase64 in Firefly response");
  }

  return Buffer.from(base64, "base64");
}
