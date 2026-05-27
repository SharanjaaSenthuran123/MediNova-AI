/**
 * Shared active-route logic for navbar, sidebar, and mobile nav.
 */
export function isNavActive(pathname: string, href: string): boolean {
  if (href.startsWith("/#")) {
    return false;
  }

  if (href === "/") {
    return pathname === "/";
  }

  if (pathname === href) {
    return true;
  }

  return pathname.startsWith(`${href}/`);
}
