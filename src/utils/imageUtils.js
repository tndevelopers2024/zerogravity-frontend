/**
 * Get the full image URL based on environment
 * In development (localhost), returns the URL as-is (local file path)
 * In production, prepends the backend base URL
 */
export const getImageUrl = (imagePath) => {
    if (!imagePath) return '';

    // If already a full URL (http:// or https://), return as-is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // Check if running on localhost
    const isLocalhost = window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';

    // In localhost, return the path as-is (for local file access)
    if (isLocalhost) {
        return imagePath;
    }

    // In production, prepend the backend URL
    const backendUrl = import.meta.env.VITE_API_URL || 'https://mitoslearning.co.in/api';
    const baseUrl = backendUrl.replace('/api', ''); // Remove /api suffix

    // Ensure path starts with /
    const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

    return `${baseUrl}${path}`;
};

/**
 * Get backend base URL for uploads
 */
export const getBackendUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://mitoslearning.co.in/api';
    return apiUrl.replace('/api', '');
};
