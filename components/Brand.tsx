import Link from "next/link";

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="CRMPlus+ — página inicial">
      <span className="brand-mark"><i /><i /><i /></span>
      <span><b>CRMPlus+</b><small>Sistemas</small></span>
    </Link>
  );
}
