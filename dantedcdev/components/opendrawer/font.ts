import localFont from "next/font/local";

// Self-hosted: Next 14.1's Google loader can't parse the URLs Google now serves.
export const rubik = localFont({
  src: "./fonts/rubik-latin.woff2",
  weight: "300 900",
  display: "swap",
});
