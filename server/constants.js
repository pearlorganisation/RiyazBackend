import dotenv from "dotenv";
dotenv.config();

export const DB_NAME = "Riaz_DB";

export const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "strict",
  secure: process.env.NODE_ENV !== "development",
};

export const UserRolesEnum = {
  ADMIN: "ADMIN",
  CUSTOMER: "CUSTOMER",
  SERVICE_PROVIDER: "SERVICE_PROVIDER",
};

export const AvailableUserRoles = Object.values(UserRolesEnum);
