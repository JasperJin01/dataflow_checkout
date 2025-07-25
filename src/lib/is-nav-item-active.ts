import type { NavItemConfig } from '@/types/nav';

export function isNavItemActive({
  pathname,
  subItems,
  href,
}: { pathname: string; subItems: NavItemConfig[] | undefined; href: string }): boolean {
  if (subItems && subItems.length > 0) {
    return subItems.some((item) => isNavItemActive({ pathname, subItems: item.subItems, href: item.href }));
  }
  return pathname === href;
}
