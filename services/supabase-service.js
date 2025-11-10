// Supabase Service Layer
// Handles all database operations for the portfolio website

class SupabaseService {
    constructor() {
        this.supabase = null;
    }

    // Projects Operations
    async getProjects() {
        try {
            if (!this.supabase) {
                // Fallback to localStorage if Supabase not configured
                return JSON.parse(localStorage.getItem('portfolioProjects') || '[]');
            }

            const { data, error } = await this.supabase
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching projects:', error);
            // Fallback to localStorage
            return JSON.parse(localStorage.getItem('portfolioProjects') || '[]');
        }
    }

    async saveProject(project, projectId = null) {
        try {
            if (!this.supabase) {
                // Fallback to localStorage
                const projects = JSON.parse(localStorage.getItem('portfolioProjects') || '[]');
                if (projectId !== null) {
                    projects[projectId] = project;
                } else {
                    projects.push(project);
                }
                localStorage.setItem('portfolioProjects', JSON.stringify(projects));
                return { success: true, data: project };
            }

            if (projectId !== null) {
                // Update existing project
                const { data, error } = await this.supabase
                    .from('projects')
                    .update(project)
                    .eq('id', projectId)
                    .select()
                    .single();

                if (error) throw error;
                return { success: true, data };
            } else {
                // Create new project
                const { data, error } = await this.supabase
                    .from('projects')
                    .insert([project])
                    .select()
                    .single();

                if (error) throw error;
                return { success: true, data };
            }
        } catch (error) {
            console.error('Error saving project:', error);
            throw error;
        }
    }

    async deleteProject(projectId) {
        try {
            if (!this.supabase) {
                // Fallback to localStorage
                const projects = JSON.parse(localStorage.getItem('portfolioProjects') || '[]');
                projects.splice(projectId, 1);
                localStorage.setItem('portfolioProjects', JSON.stringify(projects));
                return { success: true };
            }

            const { error } = await this.supabase
                .from('projects')
                .delete()
                .eq('id', projectId);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error deleting project:', error);
            throw error;
        }
    }

    // Services Operations
    async getServices() {
        try {
            if (!this.supabase) {
                return JSON.parse(localStorage.getItem('portfolioServices') || '[]');
            }

            const { data, error } = await this.supabase
                .from('services')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching services:', error);
            return JSON.parse(localStorage.getItem('portfolioServices') || '[]');
        }
    }

    async saveService(service, serviceId = null) {
        try {
            if (!this.supabase) {
                const services = JSON.parse(localStorage.getItem('portfolioServices') || '[]');
                if (serviceId !== null) {
                    services[serviceId] = service;
                } else {
                    services.push(service);
                }
                localStorage.setItem('portfolioServices', JSON.stringify(services));
                return { success: true, data: service };
            }

            if (serviceId !== null) {
                const { data, error } = await this.supabase
                    .from('services')
                    .update(service)
                    .eq('id', serviceId)
                    .select()
                    .single();

                if (error) throw error;
                return { success: true, data };
            } else {
                const { data, error } = await this.supabase
                    .from('services')
                    .insert([service])
                    .select()
                    .single();

                if (error) throw error;
                return { success: true, data };
            }
        } catch (error) {
            console.error('Error saving service:', error);
            throw error;
        }
    }

    async deleteService(serviceId) {
        try {
            if (!this.supabase) {
                const services = JSON.parse(localStorage.getItem('portfolioServices') || '[]');
                services.splice(serviceId, 1);
                localStorage.setItem('portfolioServices', JSON.stringify(services));
                return { success: true };
            }

            const { error } = await this.supabase
                .from('services')
                .delete()
                .eq('id', serviceId);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error deleting service:', error);
            throw error;
        }
    }

    // About Page Operations
    async getAboutData() {
        try {
            if (!this.supabase) {
                return JSON.parse(localStorage.getItem('portfolioAbout') || '{}');
            }

            const { data, error } = await this.supabase
                .from('about_content')
                .select('*')
                .single();

            if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
            
            if (!data) {
                return {};
            }

            // Parse JSON fields
            return {
                journey: data.journey || '',
                profile_photo_url: data.profile_photo_url || '',
                stats: data.stats ? (typeof data.stats === 'string' ? JSON.parse(data.stats) : data.stats) : [],
                education: data.education ? (typeof data.education === 'string' ? JSON.parse(data.education) : data.education) : [],
                skills: data.skills ? (typeof data.skills === 'string' ? JSON.parse(data.skills) : data.skills) : []
            };
        } catch (error) {
            console.error('Error fetching about data:', error);
            return JSON.parse(localStorage.getItem('portfolioAbout') || '{}');
        }
    }

    async saveAboutData(aboutData) {
        try {
            if (!this.supabase) {
                localStorage.setItem('portfolioAbout', JSON.stringify(aboutData));
                return { success: true };
            }

            // Check if record exists
            const { data: existing } = await this.supabase
                .from('about_content')
                .select('id')
                .single();

            const record = {
                journey: aboutData.journey || '',
                profile_photo_url: aboutData.profile_photo_url || '',
                stats: JSON.stringify(aboutData.stats || []),
                education: JSON.stringify(aboutData.education || []),
                skills: JSON.stringify(aboutData.skills || []),
                updated_at: new Date().toISOString()
            };

            if (existing) {
                // Update existing
                const { error } = await this.supabase
                    .from('about_content')
                    .update(record)
                    .eq('id', existing.id);

                if (error) throw error;
            } else {
                // Create new
                const { error } = await this.supabase
                    .from('about_content')
                    .insert([record]);

                if (error) throw error;
            }

            return { success: true };
        } catch (error) {
            console.error('Error saving about data:', error);
            throw error;
        }
    }

    // Photo Upload Operations
    async uploadPhoto(file) {
        try {
            if (!this.supabase) {
                throw new Error('Supabase not initialized');
            }

            // Generate unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `profile-photo-${Date.now()}.${fileExt}`;
            const filePath = `profile-photos/${fileName}`;

            // Upload to Supabase Storage
            const { data, error } = await this.supabase.storage
                .from('portfolio-assets')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            // Get public URL
            const { data: urlData } = this.supabase.storage
                .from('portfolio-assets')
                .getPublicUrl(filePath);

            return { success: true, url: urlData.publicUrl };
        } catch (error) {
            console.error('Error uploading photo:', error);
            throw error;
        }
    }

    async deletePhoto(photoUrl) {
        try {
            if (!this.supabase || !photoUrl) {
                return { success: true };
            }

            // Extract file path from URL
            const urlParts = photoUrl.split('/');
            const fileName = urlParts[urlParts.length - 1];
            const filePath = `profile-photos/${fileName}`;

            // Delete from storage
            const { error } = await this.supabase.storage
                .from('portfolio-assets')
                .remove([filePath]);

            if (error) {
                console.warn('Error deleting photo from storage:', error);
                // Don't throw - continue even if storage deletion fails
            }

            return { success: true };
        } catch (error) {
            console.error('Error deleting photo:', error);
            throw error;
        }
    }

    // Initialize Supabase client with provided credentials
    initializeClient(url, anonKey) {
        if (typeof supabase === 'undefined') {
            console.error('Supabase client library not loaded');
            return false;
        }

        this.supabase = supabase.createClient(url, anonKey);
        return true;
    }
}

// Create singleton instance
const supabaseService = new SupabaseService();

// Initialize when config is loaded
if (typeof supabaseUrl !== 'undefined' && typeof supabaseAnonKey !== 'undefined') {
    if (typeof supabase !== 'undefined') {
        supabaseService.initializeClient(supabaseUrl, supabaseAnonKey);
    }
}

