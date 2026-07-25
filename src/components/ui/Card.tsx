import type { ReactNode } from "react";

export default function Card({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`rounded-2xl border border-black/5 bg-card ${className}`}>
      {children}
    </div>
  );
}
