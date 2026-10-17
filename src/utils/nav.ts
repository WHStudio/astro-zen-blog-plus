export function isNavActive(href: string, pathname: string): boolean {
  const path = pathname.replace(/\/$/, '') || '/';
  if (href === '/') return path === '/';
  return path === href || path.startsWith(`${href}/`);
}
