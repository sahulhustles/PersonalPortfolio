// Admin Panel JavaScript
class AdminManager {
    constructor() {
        this.checkAuthAsync();
    }

    async checkAuthAsync() {
        // Check if user is authenticated with Supabase
        const { session } = await authService.getSession();
        
        if (!session) {
            // Not authenticated - redirect to login
            window.location.href = 'admin-login.html';
            return;
        }
        
        // User is authenticated - initialize admin panel
        this.init();
    }

    checkAuth() {
        // Deprecated - kept for backwards compatibility
        // Now using checkAuthAsync() with Supabase Auth
    }

    init() {
        this.initTabs();
        this.initProjects();
        this.initServices();
        this.initAbout();
        this.initSettings();
        this.initLogout();
        this.loadInitialData();
        
        // Initialize Supabase client after config loads
        if (typeof supabaseUrl !== 'undefined' && typeof supabaseAnonKey !== 'undefined' && typeof supabase !== 'undefined') {
            if (typeof supabaseService !== 'undefined') {
                supabaseService.initializeClient(supabaseUrl, supabaseAnonKey);
            }
        }
    }

    initTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-tab');

                // Remove active class from all tabs
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));

                // Add active class to clicked tab
                btn.classList.add('active');
                document.getElementById(`${targetTab}Tab`).classList.add('active');
            });
        });
    }

    initProjects() {
        this.renderProjects();
        
        document.getElementById('addProjectBtn').addEventListener('click', () => {
            this.openProjectModal();
        });

        document.getElementById('projectForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProject();
        });

        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeProjectModal();
        });

        document.getElementById('cancelProjectBtn').addEventListener('click', () => {
            this.closeProjectModal();
        });

        // Close modal when clicking outside
        document.getElementById('projectModal').addEventListener('click', (e) => {
            if (e.target.id === 'projectModal') {
                this.closeProjectModal();
            }
        });
    }

    initServices() {
        this.renderServices();
        
        document.getElementById('addServiceBtn').addEventListener('click', () => {
            this.openServiceModal();
        });

        document.getElementById('serviceForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveService();
        });

        document.getElementById('closeServiceModal').addEventListener('click', () => {
            this.closeServiceModal();
        });

        document.getElementById('cancelServiceBtn').addEventListener('click', () => {
            this.closeServiceModal();
        });

        // Close modal when clicking outside
        document.getElementById('serviceModal').addEventListener('click', (e) => {
            if (e.target.id === 'serviceModal') {
                this.closeServiceModal();
            }
        });
    }

    initAbout() {
        this.loadAboutData();
        
        document.getElementById('saveAboutBtn').addEventListener('click', () => {
            this.saveAbout();
        });

        document.getElementById('addStatBtn').addEventListener('click', () => {
            this.addStat();
        });

        document.getElementById('addEducationBtn').addEventListener('click', () => {
            this.addEducation();
        });

        document.getElementById('addSkillCategoryBtn').addEventListener('click', () => {
            this.addSkillCategory();
        });

        // Photo management
        document.getElementById('photoUpload').addEventListener('change', (e) => {
            this.previewPhoto(e.target.files[0]);
        });

        document.getElementById('uploadPhotoBtn').addEventListener('click', () => {
            this.uploadPhoto();
        });

        document.getElementById('removePhotoBtn').addEventListener('click', () => {
            this.removePhoto();
        });

        document.getElementById('savePhotoUrlBtn').addEventListener('click', () => {
            this.savePhotoUrl();
        });
    }

    initSettings() {
        document.getElementById('saveCredentialsBtn').addEventListener('click', () => {
            this.saveCredentials();
        });

        document.getElementById('exportDataBtn').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('importDataBtn').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });

        document.getElementById('importFile').addEventListener('change', (e) => {
            this.importData(e.target.files[0]);
        });
    }

    initLogout() {
        document.getElementById('logoutBtn').addEventListener('click', async () => {
            const logoutBtn = document.getElementById('logoutBtn');
            logoutBtn.textContent = 'Logging out...';
            logoutBtn.disabled = true;
            
            const result = await authService.signOut();
            
            if (result.success) {
                window.location.href = 'admin-login.html';
            } else {
                showError('Failed to logout. Please try again.');
                logoutBtn.textContent = 'Logout';
                logoutBtn.disabled = false;
            }
        });
    }

    // Projects Management
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

    async renderProjects() {
        const projects = await this.getProjects();
        const grid = document.getElementById('projectsGrid');
        
        if (projects.length === 0) {
            grid.innerHTML = '<p style="color: var(--text-secondary);">No projects yet. Click "Add New Project" to get started.</p>';
            return;
        }

        grid.innerHTML = projects.map((project, index) => {
            const projectId = project.id || index;
            const techStack = project.tech_stack || project.techStack || [];
            return `
            <div class="project-card-admin">
                <h3>${this.escapeHtml(project.title)}</h3>
                <p>${this.escapeHtml(project.description.substring(0, 100))}...</p>
                <div class="tech-stack">
                    ${techStack.length > 0 ? 
                        techStack.map(tech => `<span class="tech-tag">${this.escapeHtml(tech)}</span>`).join('') 
                        : ''}
                </div>
                ${project.featured ? '<span style="color: var(--primary-color); font-weight: 600;">Featured</span>' : ''}
                <div class="card-actions">
                    <button class="btn btn-secondary" onclick="adminManager.editProject('${projectId}', ${index})">Edit</button>
                    <button class="btn btn-danger" onclick="adminManager.deleteProject('${projectId}', ${index})">Delete</button>
                </div>
            </div>
        `;
        }).join('');
    }

    async openProjectModal(projectId = null, projectIndex = null) {
        const modal = document.getElementById('projectModal');
        const form = document.getElementById('projectForm');
        const title = document.getElementById('modalTitle');
        
        if (projectId !== null) {
            const projects = await this.getProjects();
            const project = projects[projectIndex] || projects.find(p => p.id === projectId);
            if (project) {
                title.textContent = 'Edit Project';
                document.getElementById('projectId').value = projectId;
                document.getElementById('projectTitle').value = project.title || '';
                document.getElementById('projectDescription').value = project.description || '';
                const techStack = project.tech_stack || project.techStack || [];
                document.getElementById('projectTech').value = Array.isArray(techStack) ? techStack.join(', ') : '';
                document.getElementById('projectLiveUrl').value = project.live_url || project.liveUrl || '';
                document.getElementById('projectCodeUrl').value = project.code_url || project.codeUrl || '';
                document.getElementById('projectFeatured').checked = project.featured || false;
            }
        } else {
            title.textContent = 'Add Project';
            form.reset();
            document.getElementById('projectId').value = '';
        }
        
        modal.classList.add('active');
    }

    closeProjectModal() {
        document.getElementById('projectModal').classList.remove('active');
    }

    async saveProject() {
        const projectId = document.getElementById('projectId').value;
        const techStack = document.getElementById('projectTech').value
            .split(',')
            .map(t => t.trim())
            .filter(t => t.length > 0);
        
        const project = {
            title: document.getElementById('projectTitle').value,
            description: document.getElementById('projectDescription').value,
            tech_stack: techStack,
            live_url: document.getElementById('projectLiveUrl').value || '',
            code_url: document.getElementById('projectCodeUrl').value || '',
            featured: document.getElementById('projectFeatured').checked
        };

        try {
            if (typeof supabaseService !== 'undefined') {
                await supabaseService.saveProject(project, projectId || null);
            } else {
                // Fallback to localStorage
                const projects = await this.getProjects();
                if (projectId !== '' && projectId !== null) {
                    const index = projects.findIndex(p => p.id === projectId || p === projects[parseInt(projectId)]);
                    if (index >= 0) {
                        projects[index] = { ...projects[index], ...project };
                    }
                } else {
                    projects.push(project);
                }
                localStorage.setItem('portfolioProjects', JSON.stringify(projects));
            }
            
            await this.renderProjects();
            this.closeProjectModal();
            this.showSuccess('Project saved successfully!');
        } catch (error) {
            console.error('Error saving project:', error);
            this.showSuccess('Error saving project. Please try again.');
        }
    }

    async editProject(projectId, index) {
        await this.openProjectModal(projectId, index);
    }

    async deleteProject(projectId, index) {
        if (confirm('Are you sure you want to delete this project?')) {
            try {
                if (typeof supabaseService !== 'undefined') {
                    await supabaseService.deleteProject(projectId);
                } else {
                    // Fallback to localStorage
                    const projects = await this.getProjects();
                    projects.splice(index, 1);
                    localStorage.setItem('portfolioProjects', JSON.stringify(projects));
                }
                
                await this.renderProjects();
                this.showSuccess('Project deleted successfully!');
            } catch (error) {
                console.error('Error deleting project:', error);
                this.showSuccess('Error deleting project. Please try again.');
            }
        }
    }

    // Services Management
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

    async renderServices() {
        const services = await this.getServices();
        const grid = document.getElementById('servicesGrid');
        
        if (services.length === 0) {
            grid.innerHTML = '<p style="color: var(--text-secondary);">No services yet. Click "Add New Service" to get started.</p>';
            return;
        }

        grid.innerHTML = services.map((service, index) => {
            const serviceId = service.id || index;
            return `
            <div class="service-card-admin">
                <h3>${this.escapeHtml(service.title)}</h3>
                <p>${this.escapeHtml(service.description.substring(0, 100))}...</p>
                <div class="card-actions">
                    <button class="btn btn-secondary" onclick="adminManager.editService('${serviceId}', ${index})">Edit</button>
                    <button class="btn btn-danger" onclick="adminManager.deleteService('${serviceId}', ${index})">Delete</button>
                </div>
            </div>
        `;
        }).join('');
    }

    async openServiceModal(serviceId = null, serviceIndex = null) {
        const modal = document.getElementById('serviceModal');
        const form = document.getElementById('serviceForm');
        const title = document.getElementById('serviceModalTitle');
        
        if (serviceId !== null) {
            const services = await this.getServices();
            const service = services[serviceIndex] || services.find(s => s.id === serviceId);
            if (service) {
                title.textContent = 'Edit Service';
                document.getElementById('serviceId').value = serviceId;
                document.getElementById('serviceTitle').value = service.title || '';
                document.getElementById('serviceDescription').value = service.description || '';
            }
        } else {
            title.textContent = 'Add Service';
            form.reset();
            document.getElementById('serviceId').value = '';
        }
        
        modal.classList.add('active');
    }

    closeServiceModal() {
        document.getElementById('serviceModal').classList.remove('active');
    }

    async saveService() {
        const serviceId = document.getElementById('serviceId').value;
        
        const service = {
            title: document.getElementById('serviceTitle').value,
            description: document.getElementById('serviceDescription').value
        };

        try {
            if (typeof supabaseService !== 'undefined') {
                await supabaseService.saveService(service, serviceId || null);
            } else {
                // Fallback to localStorage
                const services = await this.getServices();
                if (serviceId !== '' && serviceId !== null) {
                    const index = services.findIndex(s => s.id === serviceId || s === services[parseInt(serviceId)]);
                    if (index >= 0) {
                        services[index] = { ...services[index], ...service };
                    }
                } else {
                    services.push(service);
                }
                localStorage.setItem('portfolioServices', JSON.stringify(services));
            }
            
            await this.renderServices();
            this.closeServiceModal();
            this.showSuccess('Service saved successfully!');
        } catch (error) {
            console.error('Error saving service:', error);
            this.showSuccess('Error saving service. Please try again.');
        }
    }

    async editService(serviceId, index) {
        await this.openServiceModal(serviceId, index);
    }

    async deleteService(serviceId, index) {
        if (confirm('Are you sure you want to delete this service?')) {
            try {
                if (typeof supabaseService !== 'undefined') {
                    await supabaseService.deleteService(serviceId);
                } else {
                    // Fallback to localStorage
                    const services = await this.getServices();
                    services.splice(index, 1);
                    localStorage.setItem('portfolioServices', JSON.stringify(services));
                }
                
                await this.renderServices();
                this.showSuccess('Service deleted successfully!');
            } catch (error) {
                console.error('Error deleting service:', error);
                this.showSuccess('Error deleting service. Please try again.');
            }
        }
    }

    // About Page Management
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

    async saveAboutData(data) {
        try {
            if (typeof supabaseService !== 'undefined') {
                await supabaseService.saveAboutData(data);
            } else {
                localStorage.setItem('portfolioAbout', JSON.stringify(data));
            }
        } catch (error) {
            console.error('Error saving about data:', error);
            throw error;
        }
    }

    async loadAboutData() {
        const data = await this.getAboutData();
        
        // Load journey text
        if (data.journey) {
            document.getElementById('aboutJourney').value = data.journey;
        }

        // Load and display photo
        if (data.profile_photo_url) {
            this.displayPhoto(data.profile_photo_url);
            document.getElementById('photoUrl').value = data.profile_photo_url;
        }

        // Load stats
        this.renderStats(data.stats || []);

        // Load education
        this.renderEducation(data.education || []);

        // Load skills
        this.renderSkills(data.skills || []);
    }

    previewPhoto(file) {
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.displayPhoto(e.target.result);
        };
        reader.readAsDataURL(file);
    }

    displayPhoto(photoUrl) {
        const preview = document.getElementById('photoPreview');
        const previewImg = document.getElementById('photoPreviewImg');
        const removeBtn = document.getElementById('removePhotoBtn');
        
        if (photoUrl) {
            previewImg.src = photoUrl;
            preview.style.display = 'block';
            removeBtn.style.display = 'inline-block';
        } else {
            preview.style.display = 'none';
            removeBtn.style.display = 'none';
        }
    }

    async uploadPhoto() {
        const fileInput = document.getElementById('photoUpload');
        const file = fileInput.files[0];
        const statusEl = document.getElementById('photoStatus');

        if (!file) {
            statusEl.textContent = 'Please select a file';
            statusEl.style.color = '#dc2626';
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            statusEl.textContent = 'File size must be less than 5MB';
            statusEl.style.color = '#dc2626';
            return;
        }

        try {
            statusEl.textContent = 'Uploading...';
            statusEl.style.color = 'var(--text-secondary)';

            let photoUrl;

            if (typeof supabaseService !== 'undefined' && supabaseService.supabase) {
                // Upload to Supabase Storage
                const result = await supabaseService.uploadPhoto(file);
                photoUrl = result.url;
            } else {
                // Fallback: Convert to base64 for localStorage
                const reader = new FileReader();
                photoUrl = await new Promise((resolve) => {
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsDataURL(file);
                });
            }

            // Save photo URL to database
            const data = await this.getAboutData();
            const oldPhotoUrl = data.profile_photo_url;
            data.profile_photo_url = photoUrl;

            // Delete old photo if it's from Supabase Storage
            if (oldPhotoUrl && typeof supabaseService !== 'undefined' && supabaseService.supabase && oldPhotoUrl.includes('supabase.co')) {
                try {
                    await supabaseService.deletePhoto(oldPhotoUrl);
                } catch (error) {
                    console.warn('Error deleting old photo:', error);
                }
            }

            await this.saveAboutData(data);
            this.displayPhoto(photoUrl);
            document.getElementById('photoUrl').value = photoUrl;
            fileInput.value = '';

            statusEl.textContent = 'Photo uploaded successfully!';
            statusEl.style.color = '#2f855a';
            this.showSuccess('Photo uploaded successfully!');

            setTimeout(() => {
                statusEl.textContent = '';
            }, 3000);
        } catch (error) {
            console.error('Error uploading photo:', error);
            statusEl.textContent = 'Error uploading photo. Please try again.';
            statusEl.style.color = '#dc2626';
            this.showSuccess('Error uploading photo. Please try again.');
        }
    }

    async removePhoto() {
        if (!confirm('Are you sure you want to remove the profile photo?')) {
            return;
        }

        try {
            const data = await this.getAboutData();
            const photoUrl = data.profile_photo_url;

            // Delete from storage if it's from Supabase
            if (photoUrl && typeof supabaseService !== 'undefined' && supabaseService.supabase && photoUrl.includes('supabase.co')) {
                try {
                    await supabaseService.deletePhoto(photoUrl);
                } catch (error) {
                    console.warn('Error deleting photo from storage:', error);
                }
            }

            // Remove from database
            data.profile_photo_url = '';
            await this.saveAboutData(data);

            this.displayPhoto('');
            document.getElementById('photoUrl').value = '';
            document.getElementById('photoUpload').value = '';

            this.showSuccess('Photo removed successfully!');
        } catch (error) {
            console.error('Error removing photo:', error);
            this.showSuccess('Error removing photo. Please try again.');
        }
    }

    async savePhotoUrl() {
        const photoUrl = document.getElementById('photoUrl').value.trim();
        const statusEl = document.getElementById('photoStatus');

        if (!photoUrl) {
            statusEl.textContent = 'Please enter a URL';
            statusEl.style.color = '#dc2626';
            return;
        }

        try {
            // Validate URL
            new URL(photoUrl);

            const data = await this.getAboutData();
            const oldPhotoUrl = data.profile_photo_url;

            // Delete old photo if it's from Supabase Storage
            if (oldPhotoUrl && typeof supabaseService !== 'undefined' && supabaseService.supabase && oldPhotoUrl.includes('supabase.co')) {
                try {
                    await supabaseService.deletePhoto(oldPhotoUrl);
                } catch (error) {
                    console.warn('Error deleting old photo:', error);
                }
            }

            data.profile_photo_url = photoUrl;
            await this.saveAboutData(data);

            this.displayPhoto(photoUrl);
            statusEl.textContent = 'Photo URL saved successfully!';
            statusEl.style.color = '#2f855a';
            this.showSuccess('Photo URL saved successfully!');

            setTimeout(() => {
                statusEl.textContent = '';
            }, 3000);
        } catch (error) {
            statusEl.textContent = 'Invalid URL. Please enter a valid URL.';
            statusEl.style.color = '#dc2626';
        }
    }

    renderStats(stats) {
        const container = document.getElementById('statsEditor');
        container.innerHTML = stats.map((stat, index) => `
            <div class="stat-editor-item">
                <input type="text" class="form-control" value="${this.escapeHtml(stat.value)}" 
                       onchange="adminManager.updateStat(${index}, 'value', this.value)" 
                       placeholder="Value">
                <input type="text" class="form-control" value="${this.escapeHtml(stat.label)}" 
                       onchange="adminManager.updateStat(${index}, 'label', this.value)" 
                       placeholder="Label">
                <button class="btn btn-danger" onclick="adminManager.removeStat(${index})" style="width: 100%; padding: 0.5rem; font-size: 12px;">Remove</button>
            </div>
        `).join('');
    }

    async addStat() {
        const data = await this.getAboutData();
        if (!data.stats) data.stats = [];
        data.stats.push({ value: '', label: '' });
        await this.saveAboutData(data);
        this.renderStats(data.stats);
    }

    async updateStat(index, field, value) {
        const data = await this.getAboutData();
        if (!data.stats) data.stats = [];
        if (!data.stats[index]) data.stats[index] = {};
        data.stats[index][field] = value;
        await this.saveAboutData(data);
    }

    async removeStat(index) {
        if (confirm('Are you sure you want to remove this stat?')) {
            const data = await this.getAboutData();
            if (data.stats) {
                data.stats.splice(index, 1);
                await this.saveAboutData(data);
                this.renderStats(data.stats);
            }
        }
    }

    renderEducation(education) {
        const container = document.getElementById('educationEditor');
        if (education.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary);">No education entries yet.</p>';
            return;
        }
        
        container.innerHTML = education.map((edu, index) => `
            <div class="education-editor-item">
                <div class="form-group">
                    <label>Year</label>
                    <input type="text" class="form-control" value="${this.escapeHtml(edu.year)}" 
                           onchange="adminManager.updateEducation(${index}, 'year', this.value)">
                </div>
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" class="form-control" value="${this.escapeHtml(edu.title)}" 
                           onchange="adminManager.updateEducation(${index}, 'title', this.value)">
                </div>
                <div class="form-group">
                    <label>Institution</label>
                    <input type="text" class="form-control" value="${this.escapeHtml(edu.institution)}" 
                           onchange="adminManager.updateEducation(${index}, 'institution', this.value)">
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea class="form-control" rows="2" 
                              onchange="adminManager.updateEducation(${index}, 'description', this.value)">${this.escapeHtml(edu.description)}</textarea>
                </div>
                <button class="btn btn-danger" onclick="adminManager.removeEducation(${index})">Remove</button>
            </div>
        `).join('');
    }

    async addEducation() {
        const data = await this.getAboutData();
        if (!data.education) data.education = [];
        data.education.push({ year: '', title: '', institution: '', description: '' });
        await this.saveAboutData(data);
        this.renderEducation(data.education);
    }

    async updateEducation(index, field, value) {
        const data = await this.getAboutData();
        if (!data.education) data.education = [];
        if (!data.education[index]) data.education[index] = {};
        data.education[index][field] = value;
        await this.saveAboutData(data);
    }

    async removeEducation(index) {
        if (confirm('Are you sure you want to remove this education entry?')) {
            const data = await this.getAboutData();
            if (data.education) {
                data.education.splice(index, 1);
                await this.saveAboutData(data);
                this.renderEducation(data.education);
            }
        }
    }

    renderSkills(skills) {
        const container = document.getElementById('skillsEditor');
        if (skills.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary);">No skill categories yet.</p>';
            return;
        }
        
        container.innerHTML = skills.map((category, catIndex) => `
            <div class="skill-category-editor">
                <div class="form-group">
                    <label>Category Name</label>
                    <input type="text" class="form-control" value="${this.escapeHtml(category.name)}" 
                           onchange="adminManager.updateSkillCategory(${catIndex}, 'name', this.value)">
                </div>
                <div class="skill-tags-editor">
                    ${category.skills.map((skill, skillIndex) => `
                        <div class="skill-tag-editor">
                            <input type="text" value="${this.escapeHtml(skill)}" 
                                   onchange="adminManager.updateSkill(${catIndex}, ${skillIndex}, this.value)">
                            <button type="button" onclick="adminManager.removeSkill(${catIndex}, ${skillIndex})">&times;</button>
                        </div>
                    `).join('')}
                    <button class="btn btn-secondary" onclick="adminManager.addSkill(${catIndex})" style="padding: 0.5rem 1rem;">+ Add Skill</button>
                </div>
                <button class="btn btn-danger" onclick="adminManager.removeSkillCategory(${catIndex})" style="margin-top: 1rem;">Remove Category</button>
            </div>
        `).join('');
    }

    async addSkillCategory() {
        const data = await this.getAboutData();
        if (!data.skills) data.skills = [];
        data.skills.push({ name: '', skills: [] });
        await this.saveAboutData(data);
        this.renderSkills(data.skills);
    }

    async updateSkillCategory(index, field, value) {
        const data = await this.getAboutData();
        if (!data.skills) data.skills = [];
        if (!data.skills[index]) data.skills[index] = { name: '', skills: [] };
        data.skills[index][field] = value;
        await this.saveAboutData(data);
    }

    async addSkill(categoryIndex) {
        const data = await this.getAboutData();
        if (!data.skills) data.skills = [];
        if (!data.skills[categoryIndex]) data.skills[categoryIndex] = { name: '', skills: [] };
        if (!data.skills[categoryIndex].skills) data.skills[categoryIndex].skills = [];
        data.skills[categoryIndex].skills.push('');
        await this.saveAboutData(data);
        this.renderSkills(data.skills);
    }

    async updateSkill(categoryIndex, skillIndex, value) {
        const data = await this.getAboutData();
        if (!data.skills) data.skills = [];
        if (!data.skills[categoryIndex]) data.skills[categoryIndex] = { name: '', skills: [] };
        if (!data.skills[categoryIndex].skills) data.skills[categoryIndex].skills = [];
        data.skills[categoryIndex].skills[skillIndex] = value;
        await this.saveAboutData(data);
    }

    async removeSkill(categoryIndex, skillIndex) {
        const data = await this.getAboutData();
        if (data.skills && data.skills[categoryIndex] && data.skills[categoryIndex].skills) {
            data.skills[categoryIndex].skills.splice(skillIndex, 1);
            await this.saveAboutData(data);
            this.renderSkills(data.skills);
        }
    }

    async removeSkillCategory(index) {
        if (confirm('Are you sure you want to remove this skill category?')) {
            const data = await this.getAboutData();
            if (data.skills) {
                data.skills.splice(index, 1);
                await this.saveAboutData(data);
                this.renderSkills(data.skills);
            }
        }
    }

    async saveAbout() {
        const data = await this.getAboutData();
        data.journey = document.getElementById('aboutJourney').value;
        await this.saveAboutData(data);
        this.showSuccess('About page content saved successfully!');
    }

    // Settings
    saveCredentials() {
        const username = document.getElementById('newUsername').value;
        const password = document.getElementById('newPassword').value;
        
        if (!username || !password) {
            alert('Please enter both username and password');
            return;
        }

        localStorage.setItem('adminCredentials', JSON.stringify({ username, password }));
        document.getElementById('newUsername').value = '';
        document.getElementById('newPassword').value = '';
        this.showSuccess('Credentials updated successfully!');
    }

    async exportData() {
        try {
            const data = {
                projects: await this.getProjects(),
                services: await this.getServices(),
                about: await this.getAboutData(),
                timestamp: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `portfolio-backup-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showSuccess('Data exported successfully!');
        } catch (error) {
            console.error('Error exporting data:', error);
            this.showSuccess('Error exporting data. Please try again.');
        }
    }

    async importData(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.projects) {
                    for (const project of data.projects) {
                        await this.saveProject(project, null);
                    }
                }
                if (data.services) {
                    for (const service of data.services) {
                        await this.saveService(service, null);
                    }
                }
                if (data.about) {
                    await this.saveAboutData(data.about);
                }
                
                await this.renderProjects();
                await this.renderServices();
                await this.loadAboutData();
                
                this.showSuccess('Data imported successfully!');
            } catch (error) {
                alert('Error importing data: ' + error.message);
            }
        };
        reader.readAsText(file);
    }

    async loadInitialData() {
        // Initialize with default data if empty
        const projects = await this.getProjects();
        if (projects.length === 0) {
            const defaultProjects = [
                {
                    title: "Enterprise REST API System",
                    description: "A comprehensive REST API built with Spring Boot and Java, featuring robust authentication, data validation, and scalable architecture.",
                    tech_stack: ["Java", "Spring Boot", "REST API", "Maven"],
                    live_url: "",
                    code_url: "https://github.com/iamneo-production/188fe43f-f425-4cfa-b69d-31d90b2925c5-6a45a651-f228-4b0e-a462-3991c13a29f9.git",
                    featured: false
                },
                {
                    title: "AI Business Plan Generator",
                    description: "An intelligent web application that leverages artificial intelligence to generate comprehensive business plans.",
                    tech_stack: ["Python", "Streamlit", "AI/ML", "NLP"],
                    live_url: "https://aibusinessplangenerator.streamlit.app",
                    code_url: "https://github.com/sahulhustles/AIBusinessPlanGenerator.git",
                    featured: true
                },
                {
                    title: "Advanced Calculator",
                    description: "A sophisticated calculator application with clean user interface and advanced mathematical operations.",
                    tech_stack: ["HTML5", "CSS3", "JavaScript", "Responsive"],
                    live_url: "",
                    code_url: "https://github.com/sahulhustles/SimpleCalculator.git",
                    featured: false
                }
            ];
            for (const project of defaultProjects) {
                if (typeof supabaseService !== 'undefined') {
                    await supabaseService.saveProject(project);
                } else {
                    projects.push(project);
                }
            }
            if (typeof supabaseService === 'undefined') {
                localStorage.setItem('portfolioProjects', JSON.stringify(projects));
            }
        }

        const services = await this.getServices();
        if (services.length === 0) {
            const defaultServices = [
                { title: "Image Editing", description: "Professional photo editing, retouching, background removal, and graphic design." },
                { title: "PDF Manipulation", description: "Complete PDF solutions including merging, splitting, compression, conversion, and form creation." },
                { title: "Audio Editing", description: "Professional audio enhancement, noise reduction, mixing, and mastering." },
                { title: "Video & Audio Extraction", description: "Extract audio from videos, convert between formats, and process multimedia content." },
                { title: "Web Development", description: "Custom web applications, responsive websites, and API development." },
                { title: "Custom Solutions", description: "Tailored digital solutions for your specific needs." }
            ];
            for (const service of defaultServices) {
                if (typeof supabaseService !== 'undefined') {
                    await supabaseService.saveService(service);
                } else {
                    services.push(service);
                }
            }
            if (typeof supabaseService === 'undefined') {
                localStorage.setItem('portfolioServices', JSON.stringify(services));
            }
        }

        const aboutData = await this.getAboutData();
        if (!aboutData.journey) {
            aboutData.journey = "I'm a passionate Computer Science Engineering student currently pursuing my B.E at Sri Krishna College of Technology, Coimbatore. My journey in technology began during my high school years at SMBM National Public School, Dindigul, where I graduated with 76.8% in 2023.\n\nThroughout my academic journey, I've developed a strong foundation in multiple programming languages and technologies. I'm particularly interested in full-stack development, cloud technologies, and artificial intelligence applications.";
            await this.saveAboutData(aboutData);
        }

        if (!aboutData.stats || aboutData.stats.length === 0) {
            aboutData.stats = [
                { value: "3+", label: "Projects Completed" },
                { value: "10+", label: "Technologies Mastered" },
                { value: "2023", label: "Started College" }
            ];
            await this.saveAboutData(aboutData);
        }

        if (!aboutData.education || aboutData.education.length === 0) {
            aboutData.education = [
                {
                    year: "2023 - Present",
                    title: "B.E Computer Science Engineering",
                    institution: "Sri Krishna College of Technology, Coimbatore",
                    description: "Currently pursuing my undergraduate degree with focus on software development, algorithms, and modern web technologies."
                },
                {
                    year: "2020 - 2023",
                    title: "Higher Secondary Education",
                    institution: "SMBM National Public School, Dindigul",
                    description: "Completed Grade 12 with 76.8%. Strong foundation in Mathematics, Physics, and Computer Science."
                }
            ];
            await this.saveAboutData(aboutData);
        }

        if (!aboutData.skills || aboutData.skills.length === 0) {
            aboutData.skills = [
                { name: "Programming Languages", skills: ["C++", "Java", "JavaScript", "Python"] },
                { name: "Web Technologies", skills: ["HTML5", "CSS3", "React", "REST API"] },
                { name: "Frameworks & Tools", skills: ["Spring Boot", "Streamlit", "Docker", "AWS"] },
                { name: "Database & Others", skills: ["DBMS", "Git", "AI/ML", "Data Structures"] }
            ];
            await this.saveAboutData(aboutData);
        }

        await this.renderProjects();
        await this.renderServices();
        await this.loadAboutData();
    }

    showSuccess(message) {
        // Create or update success message
        let successMsg = document.getElementById('successMessage');
        if (!successMsg) {
            successMsg = document.createElement('div');
            successMsg.id = 'successMessage';
            successMsg.className = 'success-message';
            document.querySelector('.main-content .container').insertBefore(
                successMsg,
                document.querySelector('.page-header').nextSibling
            );
        }
        successMsg.textContent = message;
        successMsg.classList.add('show');
        
        setTimeout(() => {
            successMsg.classList.remove('show');
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize admin manager when DOM is ready
let adminManager;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        adminManager = new AdminManager();
    });
} else {
    adminManager = new AdminManager();
}

