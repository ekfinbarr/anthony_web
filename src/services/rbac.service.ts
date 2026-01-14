/**
 * RBAC (Roles & Permissions) API Service
 *
 * NOTE: Not all deployments expose these endpoints. The admin UI will gracefully
 * show an empty/error state if unavailable.
 */

import { apiClient } from "@/lib/apiClient";

export interface Role {
  id: string;
  name: string;
  description?: string | null;
  is_system?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Permission {
  id: string;
  name: string;
  description?: string | null;
  module?: string | null;
}

export const listRoles = async () => {
  const res = await apiClient.get<{ data: Role[] } | Role[]>("roles");
  return res.data;
};

export const listPermissions = async () => {
  const res = await apiClient.get<{ data: Permission[] } | Permission[]>("permissions");
  return res.data;
};

export const createRole = async (payload: { name: string; description?: string | null }) => {
  const res = await apiClient.post("roles", payload);
  return res.data as unknown;
};

export const updateRole = async (id: string, payload: { name?: string; description?: string | null }) => {
  const res = await apiClient.put(`roles/${id}`, payload);
  return res.data as unknown;
};

export const deleteRole = async (id: string) => {
  const res = await apiClient.delete(`roles/${id}`);
  return res.data as unknown;
};

export const setRolePermissions = async (id: string, permissionNames: string[]) => {
  const res = await apiClient.post(`roles/${id}/permissions`, { permissions: permissionNames });
  return res.data as unknown;
};

export const assignUsersToRole = async (id: string, userIds: string[]) => {
  const res = await apiClient.post(`roles/${id}/users`, { users: userIds });
  return res.data as unknown;
};

export default {
  listRoles,
  listPermissions,
  createRole,
  updateRole,
  deleteRole,
  setRolePermissions,
  assignUsersToRole,
};


