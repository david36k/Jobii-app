import 'react-native-url-polyfill/auto'; // <--- חובה! תיקון לקריסות
import AsyncStorage from '@react-native-async-storage/async-storage'; // <--- חובה! שמירת חיבור
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// בדיקה שיש כתובות (רק תוודא שיש לך קובץ .env עם המשתנים האלה)
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage, // <--- זה מה ששומר את המשתמש מחובר!
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

console.log('[Supabase] Client initialized');