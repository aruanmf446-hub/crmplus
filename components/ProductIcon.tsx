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
  if (slug === "zeus") return <svg {...common}><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z" /><circle cx="7" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></svg>;
  if (slug === "alexandria") return <svg {...common}><path d="M4 5h7a3 3 0 0 1 3 3v11H7a3 3 0 0 0-3 3Z" /><path d="M20 5h-3a3 3 0 0 0-3 3v11h3a3 3 0 0 1 3 3Z" /></svg>;
  if (slug === "olympus") return <svg {...common}><path d="m3 11 9-8 9 8v10h-6v-6H9v6H3Z" /><path d="M8 11h8" /></svg>;
  if (slug === "argus") return <svg {...common}><path d="M3 11V4h7l11 11-7 7Z" /><circle cx="7" cy="8" r="1" /><path d="M13 13h4" /></svg>;
  if (slug === "hermes") return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18M8 15h3M13 15h3" /></svg>;
  if (slug === "athena") return <svg {...common}><path d="M5 21h14M7 17h10M8 17V8l4-5 4 5v9M5 8h14" /><path d="M10 11h4" /></svg>;
  if (slug === "gaia") return <svg {...common}><path d="M12 21V9M12 14c-5 0-8-3-8-8 5 0 8 3 8 8ZM12 17c5 0 8-3 8-8-5 0-8 3-8 8Z" /></svg>;
  if (slug === "pegasus") return <svg {...common}><circle cx="8" cy="7" r="2" /><circle cx="16" cy="7" r="2" /><circle cx="5" cy="12" r="2" /><circle cx="19" cy="12" r="2" /><path d="M12 11c-4 0-7 4-7 7 0 2 2 3 4 2l3-1 3 1c2 1 4 0 4-2 0-3-3-7-7-7Z" /></svg>;
  if (slug === "titans") return <svg {...common}><path d="M4 21V9l8-6 8 6v12M8 21v-6h8v6M3 21h18" /><path d="M9 9h6" /></svg>;
  return <svg {...common}><path d="M7 3h8l4 4v14H7z" /><path d="M15 3v5h4M10 13h6M10 17h4" /></svg>;
}
