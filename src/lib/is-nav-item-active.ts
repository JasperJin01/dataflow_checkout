import type { NavItemConfig } from '@/types/nav';

export function isNavItemActive({
  pathname,
  subItems,
  href,
}: { pathname: string; subItems: NavItemConfig[] | undefined; href: string }): boolean {
  const normalizedPathname = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
  const normalizedHref = href.endsWith('/') && href.length > 1 ? href.slice(0, -1) : href;
  
  let isActive = normalizedPathname === normalizedHref;

  if (subItems && subItems.length > 0) {
    isActive = isActive || subItems.some((item) => isNavItemActive({ pathname, subItems: item.subItems, href: item.href }));
  }
  
  return isActive;
}
