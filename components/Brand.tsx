import Link from "next/link";

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="CRM Plus Store — página inicial">
      <span className="brand-mark"><i /><i /><i /></span>
      <span><b>CRM Plus</b><small>Store</small></span>
    </Link>
  );
}
