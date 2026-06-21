import { requireRole, getUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { PageHeader } from "@/components/site/page-header";
import { UsersTable, type AdminUserRow } from "@/components/admin/users-table";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await requireRole(["admin"]);
  const user = await getUser();
  const db = createAdminClient();

  const { data } = await db
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .order("created_at", { ascending: false });

  const users: AdminUserRow[] = (data ?? []).map((p) => ({
    id: p.id,
    email: p.email,
    fullName: p.full_name,
    role: p.role,
    createdAt: p.created_at,
  }));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <PageHeader
        title="Users"
        description="Manage roles across the platform."
      />
      <div className="mt-6">
        <UsersTable users={users} currentAdminId={user?.id ?? null} />
      </div>
    </div>
  );
}
