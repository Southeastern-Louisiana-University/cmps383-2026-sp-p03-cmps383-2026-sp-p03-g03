export const APP_ROUTES = {
  home: "/",
  menu: "/menu",
  orders: "/orders",
  cart: "/cart",
  reservations: "/reservations",
  auth: "/auth",
  profile: "/profile",
} as const;

const ROUTE_ALIASES: Record<string, string> = {
  "/order": APP_ROUTES.menu,
  "/reserve": APP_ROUTES.reservations,
};

export function normalizeRoute(pathname: string) {
  return ROUTE_ALIASES[pathname] ?? pathname;
}

export function isActiveRoute(currentPath: string, targetPath: string) {
  return normalizeRoute(currentPath) === normalizeRoute(targetPath);
}
