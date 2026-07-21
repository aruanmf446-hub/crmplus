type Props = { slug: string; size?: number };

export function ProductIcon({ slug, size = 24 }: Props) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (slug === "atlas") return <svg {...common}><path d="m14.6 6.1 3.3-3.3a4.2 4.2 0 0 1-5.4 5.4L5 15.7a2.1 2.1 0 0 0 3 3l7.5-7.5a4.2 4.2 0 0 0 5.4-5.4l-3.3 3.3-3-3Z" /></svg>;
  if (slug === "artemis") return <svg {...common}><path d="M4 16h16M6 16a6 6 0 0 1 12 0M12 7V5M3 19h18" /></svg>;
  if (slug === "poseidon") return <svg {...common}><path d="M5 19V9M12 19V5M19 19v-7M3 19h18" /></svg>;
  if (slug === "hercules") return <svg {...common}><path d="M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2" /></svg>;
  if (slug === "pandora") return <svg {...common}><path d="M20 15a4 4 0 0 1-4 4H9l-5 3v-7a4 4 0 0 1-1-2.6V7a4 4 0 0 1 4-4h9a4 4 0 0 1 4 4Z" /><path d="M8 9h8M8 13h5" /></svg>;
  return <svg {...common}><path d="M7 3h8l4 4v14H7z" /><path d="M15 3v5h4M10 13h6M10 17h4" /></svg>;
}
