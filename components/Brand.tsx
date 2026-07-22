import Link from "next/link";

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="CRMPlus+ — página inicial">
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 32 32"><rect x="4" y="4" width="10" height="10" rx="3" /><rect x="4" y="18" width="10" height="10" rx="3" /><rect x="18" y="18" width="10" height="10" rx="3" /><path d="M23 4v10M18 9h10" /></svg>
      </span>
      <span><b>CRMPlus+</b><small>Sistemas</small></span>
    </Link>
  );
}
