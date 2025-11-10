// Image Optimization Utility
class ImageOptimizer {
    constructor() {
        this.maxWidth = 1920;
        this.maxHeight = 1080;
        this.quality = 0.85;
    }

    /**
     * Optimize an image file
     * @param {File} file - The image file to optimize
     * @param {Object} options - Optimization options
     * @returns {Promise<Blob>} - Optimized image blob
     */
    async optimizeImage(file, options = {}) {
        const {
            maxWidth = this.maxWidth,
            maxHeight = this.maxHeight,
            quality = this.quality,
            outputFormat = 'image/jpeg'
        } = options;

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                
                img.onload = () => {
                    try {
                        // Calculate new dimensions
                        let width = img.width;
                        let height = img.height;
                        
                        if (width > maxWidth || height > maxHeight) {
                            const ratio = Math.min(maxWidth / width, maxHeight / height);
                            width = Math.floor(width * ratio);
                            height = Math.floor(height * ratio);
                        }
                        
                        // Create canvas and draw resized image
                        const canvas = document.createElement('canvas');
                        canvas.width = width;
                        canvas.height = height;
                        
                        const ctx = canvas.getContext('2d');
                        ctx.imageSmoothingEnabled = true;
                        ctx.imageSmoothingQuality = 'high';
                        ctx.drawImage(img, 0, 0, width, height);
                        
                        // Convert to blob
                        canvas.toBlob(
                            (blob) => {
                                if (blob) {
                                    resolve(blob);
                                } else {
                                    reject(new Error('Failed to create blob'));
                                }
                            },
                            outputFormat,
                            quality
                        );
                    } catch (error) {
                        reject(error);
                    }
                };
                
                img.onerror = () => {
                    reject(new Error('Failed to load image'));
                };
                
                img.src = e.target.result;
            };
            
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            
            reader.readAsDataURL(file);
        });
    }

    /**
     * Optimize image for profile photo (square crop)
     * @param {File} file - The image file
     * @param {number} size - Target size (width and height)
     * @returns {Promise<Blob>}
     */
    async optimizeProfilePhoto(file, size = 400) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                
                img.onload = () => {
                    try {
                        // Create square canvas
                        const canvas = document.createElement('canvas');
                        canvas.width = size;
                        canvas.height = size;
                        
                        const ctx = canvas.getContext('2d');
                        ctx.imageSmoothingEnabled = true;
                        ctx.imageSmoothingQuality = 'high';
                        
                        // Calculate crop dimensions (center crop)
                        const minDim = Math.min(img.width, img.height);
                        const sx = (img.width - minDim) / 2;
                        const sy = (img.height - minDim) / 2;
                        
                        // Draw cropped and resized image
                        ctx.drawImage(
                            img,
                            sx, sy, minDim, minDim,
                            0, 0, size, size
                        );
                        
                        // Convert to blob
                        canvas.toBlob(
                            (blob) => {
                                if (blob) {
                                    resolve(blob);
                                } else {
                                    reject(new Error('Failed to create blob'));
                                }
                            },
                            'image/jpeg',
                            0.9
                        );
                    } catch (error) {
                        reject(error);
                    }
                };
                
                img.onerror = () => {
                    reject(new Error('Failed to load image'));
                };
                
                img.src = e.target.result;
            };
            
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            
            reader.readAsDataURL(file);
        });
    }

    /**
     * Validate image file
     * @param {File} file - The file to validate
     * @param {number} maxSizeMB - Maximum file size in MB
     * @returns {Object} - Validation result
     */
    validateImage(file, maxSizeMB = 5) {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const maxSize = maxSizeMB * 1024 * 1024;
        
        if (!file) {
            return { valid: false, error: 'No file selected' };
        }
        
        if (!validTypes.includes(file.type)) {
            return { valid: false, error: 'Invalid file type. Please use JPG, PNG, or WebP' };
        }
        
        if (file.size > maxSize) {
            return { valid: false, error: `File too large. Maximum size is ${maxSizeMB}MB` };
        }
        
        return { valid: true };
    }

    /**
     * Get file size in human-readable format
     * @param {number} bytes - File size in bytes
     * @returns {string}
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Create preview URL from file
     * @param {File} file - The image file
     * @returns {string} - Object URL
     */
    createPreviewURL(file) {
        return URL.createObjectURL(file);
    }

    /**
     * Revoke preview URL to free memory
     * @param {string} url - The object URL to revoke
     */
    revokePreviewURL(url) {
        URL.revokeObjectURL(url);
    }

    /**
     * Add lazy loading to images
     */
    enableLazyLoading() {
        if ('loading' in HTMLImageElement.prototype) {
            // Native lazy loading supported
            const images = document.querySelectorAll('img[data-src]');
            images.forEach(img => {
                img.src = img.dataset.src;
                img.loading = 'lazy';
            });
        } else {
            // Fallback to Intersection Observer
            const images = document.querySelectorAll('img[data-src]');
            
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                });
            });
            
            images.forEach(img => imageObserver.observe(img));
        }
    }
}

// Create global instance
const imageOptimizer = new ImageOptimizer();

// Initialize lazy loading when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        imageOptimizer.enableLazyLoading();
    });
} else {
    imageOptimizer.enableLazyLoading();
}
