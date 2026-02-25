import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const Item = ({ children, active = false, to, className = "" }) => {
  const baseClass = `line-clamp-1 cursor-pointer break-words text-sm font-medium transition-colors ${
    active ? 'text-[#1f2328]' : 'text-[#6e7781] hover:text-[#1f2328]'
  } ${className}`;

  if (active || !to) {
    return <span className={baseClass}>{children}</span>;
  }

  return (
    <Link to={to} className={baseClass}>
      {children}
    </Link>
  );
};

const Divider = () => (
  <ChevronRight className="text-[#afb8c1] shrink-0" size={14} />
);

const BreadcrumbsRoot = ({ children, className = "" }) => {
  if (!children) return null;
  return (
    <nav className={`flex items-center gap-2 mb-6 ${className}`}>
      {children}
    </nav>
  );
};

export const Breadcrumbs = Object.assign(BreadcrumbsRoot, {
  Item,
  Divider,
});

export default Breadcrumbs;