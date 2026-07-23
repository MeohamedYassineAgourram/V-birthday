import Link from "next/link";

export default function Button({ href, children, variant = "primary", onClick, type = "button" }) {
  const className = `landing-button landing-button--${variant}`;

  if (href) {
    return <Link className={className} href={href}>{children}</Link>;
  }

  return <button className={className} onClick={onClick} type={type}>{children}</button>;
}
