import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/**
 * Signature brand button: sharp corner, uppercase tracked, arrow expands on hover.
 * Supports "to" (Link), "href" (anchor), or onClick (button).
 * variant: 'primary' (cyan) | 'dark' | 'outline' | 'light'
 */
export default function TicButton({
  children,
  to,
  href,
  onClick,
  variant = 'dark',
  size = 'md',
  arrow = true,
  disabled = false,
  type = 'button',
  className = '',
}) {
  const variants = {
    primary: 'bg-cyan text-dark-deep hover:bg-dark-deep hover:text-cyan',
    dark: 'bg-dark-deep text-white hover:bg-cyan hover:text-dark-deep',
    outline: 'bg-transparent text-dark-deep border border-dark-deep hover:bg-dark-deep hover:text-white',
    light: 'bg-white text-dark-deep hover:bg-dark-deep hover:text-white',
  };

  const sizes = {
    sm: 'px-6 py-3 text-[10px]',
    md: 'px-8 py-4 text-[11px]',
    lg: 'px-10 py-5 text-xs',
  };

  const base = `inline-flex items-center justify-center gap-2 tracking-[0.2em] uppercase font-body font-medium rounded-full transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:transform-none group ${variants[variant]} ${sizes[size]} ${className}`;

  const content = (
    <>
      <span>{children}</span>
      {arrow && <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />}
    </>
  );

  if (to) return <Link to={to} className={base}>{content}</Link>;
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" className={base}>{content}</a>;
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={base}>
      {content}
    </button>
  );
}