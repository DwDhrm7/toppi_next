/**
 * Global application configuration.
 * Config app (theme, menu, role)
 */

export const THEME_CONFIG = {
  primaryColor: "#F97316",
  secondaryColor: "#E85D04",
};

export const MENU_CONFIG = [
  { label: "Dashboard", path: "/dashboard", roles: ["Superadmin", "Operator"] },
  { label: "Device TOPPI", path: "/device-toppi", roles: ["Superadmin"] },
  { label: "Companies", path: "/companies", roles: ["Superadmin"] },
  { label: "TOPPI Log", path: "/toppi-log", roles: ["Superadmin", "Operator"] },
];

export const ROLE_CONFIG = {
  SUPERADMIN: "Superadmin",
  OPERATOR: "Operator",
};
