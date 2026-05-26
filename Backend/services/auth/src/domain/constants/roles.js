export const USER_ROLES = {
  CLIENT: "client",
  CHEF: "chef"
};

export const ADMIN_ROLES = {
  ADMIN: "admin",
  MANAGER: "manager"
};

export const ALL_ROLES = {
  ...USER_ROLES,
  ...ADMIN_ROLES
};