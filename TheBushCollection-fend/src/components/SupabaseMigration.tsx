import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Upload, Database } from 'lucide-react';
import { SafariDataMigration } from '@/utils/supabase-migration';
import { toast } from 'sonner';

export default function SupabaseMigration() {
  const [migrationStatus, setMigrationStatus] = useState<{
    properties: { status: 'pending' | 'running' | 'success' | 'error'; message: string };
    packages: { status: 'pending' | 'running' | 'success' | 'error'; message: string };
    bookings: { status: 'pending' | 'running' | 'success' | 'error'; message: string };
  }>({
    properties: { status: 'pending', message: 'Ready to migrate' },
    packages: { status: 'pending', message: 'Ready to migrate' },
    bookings: { status: 'pending', message: 'Ready to migrate' },
  });

  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const runMigration = async () => {
    setIsRunning(true);
    setProgress(0);

    try {
      // Migrate Properties
      setMigrationStatus(prev => ({
        ...prev,
        properties: { status: 'running', message: 'Migrating properties...' }
      }));
      setProgress(10);

      const propertiesResult = await SafariDataMigration.migrateProperties();
      setMigrationStatus(prev => ({
        ...prev,
        properties: {
          status: propertiesResult.success ? 'success' : 'error',
          message: propertiesResult.message
        }
      }));
      setProgress(40);

      // Migrate Packages
      setMigrationStatus(prev => ({
        ...prev,
        packages: { status: 'running', message: 'Migrating packages...' }
      }));

      const packagesResult = await SafariDataMigration.migratePackages();
      setMigrationStatus(prev => ({
        ...prev,
        packages: {
          status: packagesResult.success ? 'success' : 'error',
          message: packagesResult.message
        }
      }));
      setProgress(70);

      // Migrate Bookings
      setMigrationStatus(prev => ({
        ...prev,
        bookings: { status: 'running', message: 'Migrating bookings...' }
      }));

      const bookingsResult = await SafariDataMigration.migrateBookings();
      setMigrationStatus(prev => ({
        ...prev,
        bookings: {
          status: bookingsResult.success ? 'success' : 'error',
          message: bookingsResult.message
        }
      }));
      setProgress(100);

      const allSuccess = propertiesResult.success && packagesResult.success && bookingsResult.success;
      
      if (allSuccess) {
        toast.success('Migration completed successfully!');
      } else {
        toast.error('Migration completed with some errors. Check the details below.');
      }

    } catch (error) {
      console.error('Migration error:', error);
      toast.error('Migration failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'running':
        return <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return <Database className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'running':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-6 w-6" />
            Safari Data Migration to Supabase
          </CardTitle>
          <p className="text-sm text-gray-600">
            Migrate your existing safari properties, packages, and bookings from local storage to Supabase database.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Migration Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Migration Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Properties */}
            <Card className={`${getStatusColor(migrationStatus.properties.status)}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Properties</h3>
                  {getStatusIcon(migrationStatus.properties.status)}
                </div>
                <p className="text-sm text-gray-600">{migrationStatus.properties.message}</p>
              </CardContent>
            </Card>

            {/* Packages */}
            <Card className={`${getStatusColor(migrationStatus.packages.status)}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Packages</h3>
                  {getStatusIcon(migrationStatus.packages.status)}
                </div>
                <p className="text-sm text-gray-600">{migrationStatus.packages.message}</p>
              </CardContent>
            </Card>

            {/* Bookings */}
            <Card className={`${getStatusColor(migrationStatus.bookings.status)}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Bookings</h3>
                  {getStatusIcon(migrationStatus.bookings.status)}
                </div>
                <p className="text-sm text-gray-600">{migrationStatus.bookings.message}</p>
              </CardContent>
            </Card>
          </div>

          {/* Migration Button */}
          <div className="flex justify-center">
            <Button
              onClick={runMigration}
              disabled={isRunning}
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              {isRunning ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Migrating...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Start Migration
                </>
              )}
            </Button>
          </div>

          {/* Important Notes */}
          <Alert>
            <AlertDescription>
              <strong>Important:</strong> Before running the migration, make sure you have:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Set up your Supabase project and configured the environment variables</li>
                <li>Created the database tables using the provided SQL schema</li>
                <li>Backed up your existing local data</li>
                <li>Tested the Supabase connection</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}