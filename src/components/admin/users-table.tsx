"use client";

import { Avatar } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import {
  DataTable,
  DataTableRow,
  DataTableCell,
} from "@/components/admin/data-table";
import { RoleSelect } from "@/components/admin/role-select";

type Role = "admin" | "creator" | "subscriber";

export interface AdminUserRow {
  id: string;
  email: string | null;
  fullName: string | null;
  role: Role;
  createdAt: string;
}

/**
 * Users table with an inline role editor. `currentAdminId` is passed so we can
 * lock the signed-in admin's own row from a self-demotion (the server action
 * also enforces this — defense in depth).
 */
export function UsersTable({
  users,
  currentAdminId,
}: {
  users: AdminUserRow[];
  currentAdminId: string | null;
}) {
  return (
    <DataTable
      columns={[
        { key: "user", label: "User" },
        { key: "email", label: "Email" },
        { key: "role", label: "Role" },
        { key: "joined", label: "Joined" },
      ]}
      empty="No users found."
    >
      {users.map((u) => {
        const isSelf = u.id === currentAdminId;
        return (
          <DataTableRow key={u.id}>
            <DataTableCell>
              <div className="flex items-center gap-3">
                <Avatar name={u.fullName ?? u.email ?? "User"} size={32} />
                <span className="font-medium text-foreground">
                  {u.fullName ?? "—"}
                </span>
              </div>
            </DataTableCell>
            <DataTableCell className="text-muted">
              {u.email ?? "—"}
            </DataTableCell>
            <DataTableCell>
              <RoleSelect
                userId={u.id}
                role={u.role}
                disabled={isSelf}
                disabledReason="You can't change your own role."
              />
            </DataTableCell>
            <DataTableCell className="text-muted">
              {formatDate(u.createdAt)}
            </DataTableCell>
          </DataTableRow>
        );
      })}
    </DataTable>
  );
}
