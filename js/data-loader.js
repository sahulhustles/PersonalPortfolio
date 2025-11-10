// Data Loader - Loads content from Supabase or localStorage for website pages
class DataLoader {
    constructor() {
        // Init will be called after Supabase is ready
    }

    async init() {
        // Load data based on current page
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        // Load profile photo for home and about pages
        if (currentPage === 'index.html' || currentPage === '' || currentPage === 'about.html') {
            await this.loadProfilePhoto();
        }
        
        if (currentPage === 'projects.html') {
            await this.loadProjects();
        } else if (currentPage === 'services.html') {
            await this.loadServices();
        } else if (currentPage === 'about.html') {
            await this.loadAbout();
        }
    }

    async loadProfilePhoto() {
        try {
            const aboutData = await this.getAboutData();
            const photoUrl = aboutData.profile_photo_url || aboutData.profilePhotoUrl || '';
            
            if (photoUrl) {
                // Load photo for home page
                const heroPhotoContainer = document.getElementById('heroPhotoContainer');
                const heroPhoto = document.getElementById('heroPhoto');
                if (heroPhotoContainer && heroPhoto) {
                    heroPhoto.src = photoUrl;
                    heroPhotoContainer.style.display = 'block';
                }

                // Load photo for about page
                const profilePhotoContainer = document.getElementById('profilePhotoContainer');
                const profilePhoto = document.getElementById('profilePhoto');
                if (profilePhotoContainer && profilePhoto) {
                    profilePhoto.src = photoUrl;
                    profilePhotoContainer.style.display = 'block';
                }
            }
        } catch (error) {
            console.error('Error loading profile photo:', error);
        }
    }

    async getProjects() {
        try {
            if (typeof supabaseService !== 'undefined') {
                return await supabaseService.getProjects();
            }
            return JSON.parse(localStorage.getItem('portfolioProjects') || '[]');
        } catch (error) {
            console.error('Error getting projects:', error);
            return JSON.parse(localStorage.getItem('portfolioProjects') || '[]');
        }
    }

    async getServices() {
        try {
            if (typeof supabaseService !== 'undefined') {
                return await supabaseService.getServices();
            }
            return JSON.parse(localStorage.getItem('portfolioServices') || '[]');
        } catch (error) {
            console.error('Error getting services:', error);
            return JSON.parse(localStorage.getItem('portfolioServices') || '[]');
        }
    }

    async getAboutData() {
        try {
            if (typeof supabaseService !== 'undefined') {
                return await supabaseService.getAboutData();
            }
            return JSON.parse(localStorage.getItem('portfolioAbout') || '{}');
        } catch (error) {
            console.error('Error getting about data:', error);
            return JSON.parse(localStorage.getItem('portfolioAbout') || '{}');
        }
    }

    async loadProjects() {
        const projects = await this.getProjects();
        const projectsGrid = document.querySelector('.projects-grid');
        
        if (!projectsGrid) return;

        // If no projects, use default projects from HTML
        if (projects.length === 0) {
            return; // Keep existing HTML content
        }

        projectsGrid.innerHTML = projects.map(project => {
            const featuredClass = project.featured ? 'featured' : '';
            const techStack = project.tech_stack || project.techStack || [];
            const liveUrl = project.live_url || project.liveUrl || '';
            const codeUrl = project.code_url || project.codeUrl || '';
            return `
                <div class="project-card ${featuredClass}">
                    <div class="project-content">
                        <h3>${this.escapeHtml(project.title)}</h3>
                        <p class="project-description">
                            ${this.escapeHtml(project.description)}
                        </p>
                        <div class="tech-stack">
                            ${techStack.length > 0 ? 
                                techStack.map(tech => `<span class="tech-tag">${this.escapeHtml(tech)}</span>`).join('') 
                                : ''}
                        </div>
                        <div class="project-links">
                            ${liveUrl ? `<a href="${this.escapeHtml(liveUrl)}" target="_blank" class="btn btn-primary">Live Demo</a>` : ''}
                            ${codeUrl ? `<a href="${this.escapeHtml(codeUrl)}" target="_blank" class="btn btn-secondary">View Code</a>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    async loadServices() {
        const services = await this.getServices();
        const servicesGrid = document.querySelector('.services-grid');
        
        if (!servicesGrid) return;

        // If no services, use default services from HTML
        if (services.length === 0) {
            return; // Keep existing HTML content
        }

        // Service icons (using the same SVG structure as original)
        const serviceIcons = [
            `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="9" cy="9" r="2"/>
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
            </svg>`,
            `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
            </svg>`,
            `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <path d="m19.07 4.93-1.41 1.41A10 10 0 0 1 19.07 19.07l1.41 1.41A12 12 0 0 0 19.07 4.93z"/>
                <path d="m15.54 8.46-1.41 1.41a4 4 0 0 1 0 4.24l1.41 1.41a6 6 0 0 0 0-7.06z"/>
            </svg>`,
            `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>`,
            `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="16 18 22 12 16 6"/>
                <polyline points="8 6 2 12 8 18"/>
            </svg>`,
            `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <circle cx="12" cy="12" r="10"/>
                <path d="m12 17 .01 0"/>
            </svg>`
        ];

        servicesGrid.innerHTML = services.map((service, index) => {
            const icon = serviceIcons[index % serviceIcons.length];
            return `
                <div class="service-card">
                    <div class="service-icon">
                        ${icon}
                    </div>
                    <h3>${this.escapeHtml(service.title)}</h3>
                    <p>${this.escapeHtml(service.description)}</p>
                </div>
            `;
        }).join('');
    }

    async loadAbout() {
        const aboutData = await this.getAboutData();
        
        // Load journey text (preserve photo if it exists)
        if (aboutData.journey) {
            const aboutText = document.querySelector('.about-text');
            if (aboutText) {
                // Check if photo container already exists
                const existingPhoto = aboutText.querySelector('#profilePhotoContainer');
                const photoHtml = existingPhoto ? existingPhoto.outerHTML : '';
                
                const paragraphs = aboutData.journey.split('\n\n');
                let html = photoHtml + '<h2>My Journey</h2>';
                paragraphs.forEach(para => {
                    if (para.trim()) {
                        html += `<p>${this.escapeHtml(para.trim())}</p>`;
                    }
                });
                aboutText.innerHTML = html;
                
                // Update photo if it exists
                if (aboutData.profile_photo_url || aboutData.profilePhotoUrl) {
                    const photoUrl = aboutData.profile_photo_url || aboutData.profilePhotoUrl;
                    const profilePhotoContainer = document.getElementById('profilePhotoContainer');
                    const profilePhoto = document.getElementById('profilePhoto');
                    if (profilePhotoContainer && profilePhoto) {
                        profilePhoto.src = photoUrl;
                        profilePhotoContainer.style.display = 'block';
                    }
                }
            }
        }

        // Load stats
        if (aboutData.stats && aboutData.stats.length > 0) {
            const statsGrid = document.querySelector('.stats-grid');
            if (statsGrid) {
                statsGrid.innerHTML = aboutData.stats.map(stat => `
                    <div class="stat-card">
                        <h3>${this.escapeHtml(stat.value)}</h3>
                        <p>${this.escapeHtml(stat.label)}</p>
                    </div>
                `).join('');
            }
        }

        // Load education
        if (aboutData.education && aboutData.education.length > 0) {
            const educationTimeline = document.querySelector('.education-timeline');
            if (educationTimeline) {
                educationTimeline.innerHTML = aboutData.education.map(edu => `
                    <div class="education-item">
                        <div class="education-year">${this.escapeHtml(edu.year)}</div>
                        <div class="education-content">
                            <h3>${this.escapeHtml(edu.title)}</h3>
                            <p class="institution">${this.escapeHtml(edu.institution)}</p>
                            <p>${this.escapeHtml(edu.description)}</p>
                        </div>
                    </div>
                `).join('');
            }
        }

        // Load skills
        if (aboutData.skills && aboutData.skills.length > 0) {
            const skillsGrid = document.querySelector('.skills-grid');
            if (skillsGrid) {
                skillsGrid.innerHTML = aboutData.skills.map(category => `
                    <div class="skill-category">
                        <h3>${this.escapeHtml(category.name)}</h3>
                        <div class="skill-tags">
                            ${category.skills.map(skill => `<span class="skill-tag">${this.escapeHtml(skill)}</span>`).join('')}
                        </div>
                    </div>
                `).join('');
            }
        }
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize data loader when DOM is ready
// Wait for Supabase to be loaded if available
async function initDataLoader() {
    // Wait a bit for Supabase config to load
    if (typeof supabaseUrl !== 'undefined' && typeof supabaseAnonKey !== 'undefined' && typeof supabase !== 'undefined') {
        if (typeof supabaseService !== 'undefined') {
            supabaseService.initializeClient(supabaseUrl, supabaseAnonKey);
        }
    }
    
    const loader = new DataLoader();
    await loader.init();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDataLoader);
} else {
    initDataLoader();
}

