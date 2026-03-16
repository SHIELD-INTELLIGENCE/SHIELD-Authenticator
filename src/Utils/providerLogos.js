const PROVIDER_DOMAIN_MAP = {
  google: "google.com",
  gmail: "gmail.com",
  github: "github.com",
  microsoft: "microsoft.com",
  outlook: "outlook.com",
  hotmail: "hotmail.com",
  yahoo: "yahoo.com",
  apple: "apple.com",
  amazon: "amazon.com",
  aws: "aws.amazon.com",
  facebook: "facebook.com",
  instagram: "instagram.com",
  x: "x.com",
  twitter: "x.com",
  linkedin: "linkedin.com",
  paypal: "paypal.com",
  dropbox: "dropbox.com",
  discord: "discord.com",
  slack: "slack.com",
  notion: "notion.so",
  reddit: "reddit.com",
  zoom: "zoom.us",
  coinbase: "coinbase.com",
  binance: "binance.com",
};

const LOGO_DEV_PUBLIC_KEY = process.env.REACT_APP_LOGODEV_TOKEN || "pk_E4snLhrWQkeaOPqtIQ3H6A";

function normalizeProvider(provider) {
  return String(provider || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function cleanDomain(input) {
  const value = String(input || "").trim().toLowerCase();
  if (!value) return "";
  return value
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .replace(/[^a-z0-9.-]/g, "");
}

function looksLikeDomain(value) {
  return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(String(value || ""));
}

function extractEmailDomain(text) {
  const source = String(text || "");
  const match = source.match(/[a-z0-9._%+-]+@([a-z0-9.-]+\.[a-z]{2,})/i);
  return match?.[1] ? cleanDomain(match[1]) : "";
}

function inferProviderDomain(provider, displayName, rawName) {
  const normalizedProvider = normalizeProvider(provider);

  if (normalizedProvider) {
    const mapped = PROVIDER_DOMAIN_MAP[normalizedProvider];
    if (mapped) return mapped;

    const providerDomain = cleanDomain(normalizedProvider);
    if (looksLikeDomain(providerDomain)) return providerDomain;

    const compact = normalizedProvider.replace(/\s+/g, "");
    if (compact && /^[a-z0-9-]+$/.test(compact)) {
      return `${compact}.com`;
    }
  }

  const fromDisplayName = extractEmailDomain(displayName);
  if (fromDisplayName) return fromDisplayName;

  return extractEmailDomain(rawName);
}

export function getProviderLogoUrl({ provider, displayName, rawName }) {
  const domain = inferProviderDomain(provider, displayName, rawName);
  if (!domain) return "";

  return `https://img.logo.dev/${encodeURIComponent(domain)}?token=${encodeURIComponent(LOGO_DEV_PUBLIC_KEY)}`;
}
