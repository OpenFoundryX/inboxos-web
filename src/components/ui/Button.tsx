import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "dark" | "outline";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-white hover:bg-accent-dark",
  dark: "bg-ink text-white hover:bg-black",
  outline: "border border-ink/15 bg-transparent text-ink hover:bg-ink/5",
};

type ButtonProps = {
  variant?: Variant;
  href?: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
};

export default function Button({
  variant = "primary",
  href,
  className = "",
  children,
  onClick,
  type = "button",
  disabled,
}: ButtonProps) {
  const cls = `${base} ${variants[variant]} ${
    disabled ? "cursor-not-allowed opacity-50" : ""
  } ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}
