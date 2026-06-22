// Supabase migration utilities removed
// These scripts previously migrated local data into Supabase.
// Supabase has been removed from the project in favor of backend APIs.
// If you need migration tools, implement server-side migration endpoints
// or adapt these utilities to call backend migration routes.

export class SafariDataMigration {
  static async migrateProperties() {
    return { success: false, message: 'Supabase removed — migration disabled. Use backend migration endpoints.' };
  }

  static async migratePackages() {
    return { success: false, message: 'Supabase removed — migration disabled. Use backend migration endpoints.' };
  }

  static async migrateBookings() {
    return { success: false, message: 'Supabase removed — migration disabled. Use backend migration endpoints.' };
  }

  static async runSampleData() {
    return { success: false, message: 'Supabase removed — sample data insertion disabled.' };
  }
  // Helper methods removed; migration utilities are disabled in favor of backend routes.
}