export const APP_ROUTES = {
  home: "/",
  menu: "/menu",
  orders: "/orders",
  cart: "/cart",
  reservations: "/reservations",
  auth: "/auth",
  profile: "/profile",
  staffHome: "/staff",
  managerHome: "/manager",
  adminHome: "/admin",
} as const;

export function homeRouteForRoles(roles: string[] | undefined): string {
  if (!roles || roles.length === 0) return APP_ROUTES.home;
  if (roles.includes("Admin")) return APP_ROUTES.adminHome;
  if (roles.includes("Manager")) return APP_ROUTES.managerHome;
  if (roles.includes("Staff")) return APP_ROUTES.staffHome;
  return APP_ROUTES.home;
}

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
