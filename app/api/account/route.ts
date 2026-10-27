import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function accountsUnavailable() {
  return NextResponse.json(
    { error: "Accounts are not available right now." },
    { status: 503 },
  );
}

export async function DELETE() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return accountsUnavailable();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) return accountsUnavailable();

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error("Failed to delete ARCANUM account", error);
    return NextResponse.json(
      { error: "Account deletion failed. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ deleted: true });
}
