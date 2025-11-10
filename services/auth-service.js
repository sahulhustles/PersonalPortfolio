// Authentication Service using Supabase Auth
class AuthService {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
    }

    initializeClient(supabaseUrl, supabaseAnonKey) {
        if (typeof supabase !== 'undefined') {
            this.supabase = supabase.createClient(supabaseUrl, supabaseAnonKey);
            this.setupAuthListener();
        }
    }

    // Set up auth state listener
    setupAuthListener() {
        if (!this.supabase) return;

        this.supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event);
            this.currentUser = session?.user || null;
            
            // Dispatch custom event for other parts of the app
            window.dispatchEvent(new CustomEvent('authStateChanged', {
                detail: { event, session, user: this.currentUser }
            }));
        });
    }

    // Sign up new user (for initial admin setup)
    async signUp(email, password) {
        try {
            if (!this.supabase) {
                throw new Error('Supabase not initialized');
            }

            const { data, error } = await this.supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;

            return { success: true, data, message: 'Check your email for verification link' };
        } catch (error) {
            console.error('Sign up error:', error);
            return { success: false, error: error.message };
        }
    }

    // Sign in
    async signIn(email, password) {
        try {
            if (!this.supabase) {
                throw new Error('Supabase not initialized');
            }

            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            this.currentUser = data.user;
            return { success: true, data, user: data.user };
        } catch (error) {
            console.error('Sign in error:', error);
            return { success: false, error: error.message };
        }
    }

    // Sign out
    async signOut() {
        try {
            if (!this.supabase) {
                throw new Error('Supabase not initialized');
            }

            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;

            this.currentUser = null;
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            return { success: false, error: error.message };
        }
    }

    // Get current session
    async getSession() {
        try {
            if (!this.supabase) {
                return { success: false, session: null };
            }

            const { data: { session }, error } = await this.supabase.auth.getSession();
            
            if (error) throw error;

            this.currentUser = session?.user || null;
            return { success: true, session, user: this.currentUser };
        } catch (error) {
            console.error('Get session error:', error);
            return { success: false, error: error.message, session: null };
        }
    }

    // Get current user
    async getCurrentUser() {
        try {
            if (!this.supabase) {
                return { success: false, user: null };
            }

            const { data: { user }, error } = await this.supabase.auth.getUser();
            
            if (error) throw error;

            this.currentUser = user;
            return { success: true, user };
        } catch (error) {
            console.error('Get user error:', error);
            return { success: false, error: error.message, user: null };
        }
    }

    // Check if user is authenticated
    async isAuthenticated() {
        const { session } = await this.getSession();
        return !!session;
    }

    // Reset password
    async resetPassword(email) {
        try {
            if (!this.supabase) {
                throw new Error('Supabase not initialized');
            }

            const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/admin-login.html`,
            });

            if (error) throw error;

            return { success: true, message: 'Password reset email sent' };
        } catch (error) {
            console.error('Reset password error:', error);
            return { success: false, error: error.message };
        }
    }

    // Update password
    async updatePassword(newPassword) {
        try {
            if (!this.supabase) {
                throw new Error('Supabase not initialized');
            }

            const { error } = await this.supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            return { success: true, message: 'Password updated successfully' };
        } catch (error) {
            console.error('Update password error:', error);
            return { success: false, error: error.message };
        }
    }
}

// Create global instance
const authService = new AuthService();

// Initialize when Supabase config is loaded
if (typeof supabaseUrl !== 'undefined' && typeof supabaseAnonKey !== 'undefined') {
    authService.initializeClient(supabaseUrl, supabaseAnonKey);
}
