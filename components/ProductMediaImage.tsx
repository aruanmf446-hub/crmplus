"use client";

import { useEffect, useState, type ReactNode } from "react";

type Props = {
  candidates: string[];
  alt: string;
  className?: string;
  fallback: ReactNode;
  eager?: boolean;
};

export function ProductMediaImage({ candidates, alt, className, fallback, eager = false }: Props) {
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [unavailable, setUnavailable] = useState(false);
  const signature = candidates.join("|");

  useEffect(() => {
    setCandidateIndex(0);
    setUnavailable(false);
  }, [signature]);

  if (unavailable || !candidates[candidateIndex]) return <>{fallback}</>;

  return (
    <img
      className={className}
      src={candidates[candidateIndex]}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      onError={() => {
        const next = candidateIndex + 1;
        if (next >= candidates.length) setUnavailable(true);
        else setCandidateIndex(next);
      }}
    />
  );
}
