import { supabase } from './supabaseClient';

export async function supabaseInsertTest() {
  const testWorker = {
    name: 'Test User',
    phone: '8888888888',
    email: 'testuser@example.com',
    age: 30,
    origin_state: 'Testland',
    skill: 'Testing',
    aadhaar: '123456789099',
    status: 'pending'
  };

  const { data, error } = await supabase
    .from('workers')
    .insert([testWorker])
    .select();

  if (error) {
    console.error('Supabase Insert Error:', error);
    alert('Supabase Insert Error: ' + error.message);
  } else {
    console.log('Supabase Insert Success:', data);
    alert('Supabase Insert Success! Check your Supabase dashboard.');
  }
} 