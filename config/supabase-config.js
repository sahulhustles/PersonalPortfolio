// Supabase Configuration
// Replace these values with your Supabase project credentials

const SUPABASE_CONFIG = {
    url: 'https://miagnhekapuelcgtyyoy.supabase.co', // Replace with your Supabase project URL
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pYWduaGVrYXB1ZWxjZ3R5eW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNzYyNzQsImV4cCI6MjA3Nzg1MjI3NH0.TjGEOJL8eHDusUr5NmSRr-WhBtZkVNPKZQiG_uFYOD8'  // Replace with your Supabase anon key
};

// Initialize Supabase client - these variables are used globally
var supabaseUrl = SUPABASE_CONFIG.url;
var supabaseAnonKey = SUPABASE_CONFIG.anonKey;

// Check if Supabase credentials are configured
if (supabaseUrl === 'https://miagnhekapuelcgtyyoy.supabase.co' || supabaseAnonKey === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pYWduaGVrYXB1ZWxjZ3R5eW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNzYyNzQsImV4cCI6MjA3Nzg1MjI3NH0.TjGEOJL8eHDusUr5NmSRr-WhBtZkVNPKZQiG_uFYOD8') {
    console.warn('⚠️ Supabase credentials not configured. Please update config/supabase-config.js with your credentials.');
    console.warn('⚠️ Website will fall back to localStorage until Supabase is configured.');
}

// Export for use in other files (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SUPABASE_CONFIG, supabaseUrl, supabaseAnonKey };
}

