import { supabase } from './supabaseClient';

export async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test 1: Check if we can connect to Supabase
    const { data: authData, error: authError } = await supabase.auth.getSession();
    console.log('Auth Test:', { authData, authError });

    // Test 2: Try to insert a test worker
    const testWorker = {
      name: 'Test Worker',
      phone: '9999999999',
      email: 'test@example.com',
      age: 25,
      origin_state: 'Test State',
      skill: 'Test Skill',
      aadhaar: '123456789012',
      status: 'pending'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('workers')
      .insert([testWorker])
      .select();

    console.log('Insert Test:', { insertData, insertError });

    // Test 3: Try to read from workers table
    const { data: readData, error: readError } = await supabase
      .from('workers')
      .select('*')
      .limit(1);

    console.log('Read Test:', { readData, readError });

    return {
      success: !authError && !insertError && !readError,
      auth: { data: authData, error: authError },
      insert: { data: insertData, error: insertError },
      read: { data: readData, error: readError }
    };
  } catch (error) {
    console.error('Connection test failed:', error);
    return {
      success: false,
      error
    };
  }
} 