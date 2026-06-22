import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle, Database, ExternalLink } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function SupabaseSetup() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [envVarsStatus, setEnvVarsStatus] = useState<'missing' | 'present'>('missing');

  useEffect(() => {
    // Supabase removed — show backend status instead
    checkEnvironmentVariables();
    testConnection();
  }, []);

  const checkEnvironmentVariables = () => {
    // Supabase env vars are no longer required. Mark as missing to guide users.
    setEnvVarsStatus('missing');
  };

  const testConnection = async () => {
    try {
      setConnectionStatus('checking');
      // Test backend API connection
      const res = await api.get('/');
      if (res.status >= 200 && res.status < 300) {
        setConnectionStatus('connected');
        toast.success('Backend API reachable');
      } else {
        setConnectionStatus('error');
        setErrorMessage(`Unexpected status: ${res.status}`);
      }
    } catch (error) {
      console.error('Supabase connection error:', error);
      setConnectionStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'present':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
      case 'missing':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'checking':
        return <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'present':
        return 'border-green-200 bg-green-50';
      case 'error':
      case 'missing':
        return 'border-red-200 bg-red-50';
      case 'checking':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-yellow-200 bg-yellow-50';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6" />
            Backend API Setup & Connection Test
          </CardTitle>
          <p className="text-sm text-gray-600">
            Verify your backend API is reachable. The app no longer uses Supabase.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Environment Variables Status */}
          <Card className={getStatusColor(envVarsStatus)}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Environment Variables</h3>
                {getStatusIcon(envVarsStatus)}
              </div>
              <p className="text-sm text-gray-600 mb-3">
            {'Supabase has been removed. The frontend now talks to the backend API. If you need to migrate data, use server-side migration routes.'}
              </p>
              {/* Supabase env vars are no longer required */}
            </CardContent>
          </Card>

          {/* Database Connection Status */}
          <Card className={getStatusColor(connectionStatus)}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Database Connection</h3>
                {getStatusIcon(connectionStatus)}
              </div>
              <p className="text-sm text-gray-600">
                {connectionStatus === 'connected' && 'Successfully connected to backend API'}
                {connectionStatus === 'checking' && 'Testing connection to backend API...'}
                {connectionStatus === 'error' && `Connection failed: ${errorMessage}`}
              </p>
              {connectionStatus === 'error' && (
                <Button 
                  onClick={testConnection} 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                >
                  Retry Connection
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Setup Instructions */}
          {/* No Supabase setup instructions — the app uses backend APIs now */}

          {/* Success Message */}
          {connectionStatus === 'connected' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Backend reachable!</strong> Your API is responding. Use backend migration routes if you need to import data.
              </AlertDescription>
            </Alert>
          )}

          {/* Quick Actions */}
          <div className="flex gap-4 pt-4 border-t">
            <Button 
              onClick={testConnection}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              Test Connection
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}