// Inline SVG placeholder — never fails, no external dependency
export const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='500' viewBox='0 0 800 500'%3E%3Crect width='800' height='500' fill='%230d1828'/%3E%3Crect x='1' y='1' width='798' height='498' fill='none' stroke='%23243044' stroke-width='2'/%3E%3Cg transform='translate(400,220)'%3E%3Cellipse cx='0' cy='30' rx='120' ry='18' fill='%23243044'/%3E%3Crect x='-90' y='-20' width='180' height='55' rx='14' fill='%231a2a3a'/%3E%3Crect x='-60' y='-50' width='120' height='40' rx='10' fill='%231a2a3a'/%3E%3Ccircle cx='-60' cy='38' r='18' fill='%23243044'/%3E%3Ccircle cx='-60' cy='38' r='9' fill='%230d1828'/%3E%3Ccircle cx='60' cy='38' r='18' fill='%23243044'/%3E%3Ccircle cx='60' cy='38' r='9' fill='%230d1828'/%3E%3C/g%3E%3Ctext x='400' y='320' text-anchor='middle' font-family='system-ui,sans-serif' font-size='15' fill='%238b98ab' letter-spacing='2'%3ENo Image Available%3C/text%3E%3C/svg%3E";

export function carImageUrl(car) {
  const imgs = car?.images;
  if (!imgs || !Array.isArray(imgs) || imgs.length === 0) return PLACEHOLDER;

  const first = imgs[0];
  if (typeof first !== "string") return PLACEHOLDER;

  // Already a full URL (presigned, CDN, etc.)
  if (first.startsWith("http")) return first;

  // Extract filename from any path
  const filename = first.includes("/") ? first.split("/").pop() : first;

  return `/cars/images/${encodeURIComponent(filename)}`;
}
