import 'react-native-url-polyfill/auto'; // <--- חובה! תיקון לקריסות
import AsyncStorage from '@react-native-async-storage/async-storage'; // <--- חובה! שמירת חיבור
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// בדיקה שיש כתובות (רק תוודא שיש לך קובץ .env עם המשתנים האלה)
if (!supabaseUrl || !supabaseAnonKey || 
    supabaseUrl.includes('your') || 
    supabaseAnonKey.includes('your')) {
  console.error('\n⚠️  [Supabase] משתני סביבה לא מוגדרים!');
  console.error('יש למלא את הערכים בקובץ env:');
  console.error('EXPO_PUBLIC_SUPABASE_URL - כתובת הפרויקט שלך מ-Supabase');
  console.error('EXPO_PUBLIC_SUPABASE_ANON_KEY - מפתח anon מ-Supabase\n');
  throw new Error('Supabase configuration missing');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage, // <--- זה מה ששומר את המשתמש מחובר!
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

if (__DEV__) {
  console.log('[Supabase] Client initialized');
};