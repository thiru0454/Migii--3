import { useState } from 'react';
import { testSupabaseConnection } from '@/utils/testSupabaseConnection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function TestSupabaseConnection() {
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runTest = async () => {
    setIsLoading(true);
    try {
      const result = await testSupabaseConnection();
      setTestResult(result);
    } catch (error) {
      console.error('Test failed:', error);
      setTestResult({ success: false, error });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Test Supabase Connection</CardTitle>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={runTest} 
          disabled={isLoading}
          className="mb-4"
        >
          {isLoading ? 'Testing...' : 'Run Connection Test'}
        </Button>

        {testResult && (
          <div className="space-y-4">
            <h3 className="font-semibold">
              Test Result: {testResult.success ? '✅ Success' : '❌ Failed'}
            </h3>
            
            <div className="space-y-2">
              <h4 className="font-medium">Auth Test:</h4>
              <pre className="bg-gray-100 p-2 rounded">
                {JSON.stringify(testResult.auth, null, 2)}
              </pre>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Insert Test:</h4>
              <pre className="bg-gray-100 p-2 rounded">
                {JSON.stringify(testResult.insert, null, 2)}
              </pre>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Read Test:</h4>
              <pre className="bg-gray-100 p-2 rounded">
                {JSON.stringify(testResult.read, null, 2)}
              </pre>
            </div>

            {testResult.error && (
              <div className="space-y-2">
                <h4 className="font-medium text-red-500">Error:</h4>
                <pre className="bg-red-50 p-2 rounded text-red-700">
                  {JSON.stringify(testResult.error, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 