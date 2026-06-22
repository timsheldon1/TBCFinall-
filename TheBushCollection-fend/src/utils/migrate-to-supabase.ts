// Supabase migration utilities removed
// These functions used to migrate localStorage data to Supabase.
// Supabase has been removed; if you need migration, implement backend migration endpoints
// and call them from here or run migration on the server side.

export async function migratePropertiesToSupabase() {
  return { success: false, message: 'Supabase removed — migration disabled. Use backend migration endpoints.' };
}

export async function migratePackagesToSupabase() {
  return { success: false, message: 'Supabase removed — migration disabled. Use backend migration endpoints.' };
}

export async function migrateAllData() {
  return { success: false, message: 'Supabase removed — migration disabled.' };
}
