// Cloudinary Configuration and Utilities
// Images are stored as URLs in Firebase, not as files

// Cloudinary configuration - Replace with your Cloudinary credentials
const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default',
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY || '',
};

// Image transformation presets for food photography
export const IMAGE_PRESETS = {
  // Professional Food Photography - Default for menu items
  foodProfessional: {
    width: 800,
    height: 600,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto:best',
    format: 'auto',
    effect: 'sharpen:100',
    colorSpace: 'srgb',
  },

  // Thumbnail for cart and lists
  thumbnail: {
    width: 150,
    height: 150,
    crop: 'thumb',
    gravity: 'auto',
    quality: 'auto:good',
    format: 'auto',
  },

  // Card image for menu display
  menuCard: {
    width: 400,
    height: 300,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto:good',
    format: 'auto',
  },

  // Hero/banner images
  hero: {
    width: 1200,
    height: 600,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto:best',
    format: 'auto',
  },

  // Background blur effect
  backgroundBlur: {
    width: 800,
    height: 600,
    crop: 'fill',
    effect: 'blur:1000',
    quality: 'auto:low',
    format: 'auto',
  },
};

export type ImagePreset = keyof typeof IMAGE_PRESETS;

// Transform options interface
interface TransformOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'scale' | 'thumb' | 'crop' | 'pad';
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west';
  quality?: string;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
  effect?: string;
  colorSpace?: string;
  radius?: number | 'max';
  background?: string;
}

// Build Cloudinary URL with transformations
export const buildCloudinaryUrl = (
  publicId: string,
  options: TransformOptions = {}
): string => {
  const { cloudName } = CLOUDINARY_CONFIG;

  if (!publicId) return '';

  // If it's already a full URL, extract public ID or return as-is
  if (publicId.startsWith('http')) {
    // Check if it's a Cloudinary URL
    if (publicId.includes('cloudinary.com')) {
      // Extract and use the URL directly with transformations
      return applyTransformationsToUrl(publicId, options);
    }
    // Return non-Cloudinary URLs as-is
    return publicId;
  }

  const transformations: string[] = [];

  if (options.width) transformations.push(`w_${options.width}`);
  if (options.height) transformations.push(`h_${options.height}`);
  if (options.crop) transformations.push(`c_${options.crop}`);
  if (options.gravity) transformations.push(`g_${options.gravity}`);
  if (options.quality) transformations.push(`q_${options.quality}`);
  if (options.format) transformations.push(`f_${options.format}`);
  if (options.effect) transformations.push(`e_${options.effect}`);
  if (options.colorSpace) transformations.push(`cs_${options.colorSpace}`);
  if (options.radius) transformations.push(`r_${options.radius}`);
  if (options.background) transformations.push(`b_${options.background}`);

  const transformString = transformations.length > 0 ? transformations.join(',') + '/' : '';

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}${publicId}`;
};

// Apply transformations to an existing Cloudinary URL
const applyTransformationsToUrl = (url: string, options: TransformOptions): string => {
  // Parse the URL to insert transformations
  const uploadIndex = url.indexOf('/upload/');
  if (uploadIndex === -1) return url;

  const transformations: string[] = [];

  if (options.width) transformations.push(`w_${options.width}`);
  if (options.height) transformations.push(`h_${options.height}`);
  if (options.crop) transformations.push(`c_${options.crop}`);
  if (options.gravity) transformations.push(`g_${options.gravity}`);
  if (options.quality) transformations.push(`q_${options.quality}`);
  if (options.format) transformations.push(`f_${options.format}`);
  if (options.effect) transformations.push(`e_${options.effect}`);

  if (transformations.length === 0) return url;

  const baseUrl = url.substring(0, uploadIndex + 8);
  let publicId = url.substring(uploadIndex + 8);

  // Check if there's a version number (v1234567890/) and preserve everything after /upload/
  // Only strip existing transformation parameters (like w_100,h_100/), not folder paths
  const versionMatch = publicId.match(/^v\d+\//);
  if (versionMatch) {
    // Has version number - insert transformations after /upload/ and before version
    return `${baseUrl}${transformations.join(',')}/${publicId}`;
  }

  // Check if starts with transformation parameters (contain underscore like w_100)
  const hasExistingTransforms = publicId.match(/^[a-z]_[^/]+/);
  if (hasExistingTransforms) {
    // Remove existing transformations but keep folder/filename
    const parts = publicId.split('/');
    const cleanParts = parts.filter(part => !part.match(/^[a-z]_/));
    publicId = cleanParts.join('/');
  }

  return `${baseUrl}${transformations.join(',')}/${publicId}`;

  };

// Get optimized image URL using a preset
export const getOptimizedImageUrl = (
  imageUrl: string,
  preset: ImagePreset = 'menuCard'
): string => {
  const presetOptions = IMAGE_PRESETS[preset];
  return buildCloudinaryUrl(imageUrl, presetOptions);
};

// Upload image to Cloudinary (client-side unsigned upload)
export const uploadImage = async (file: File): Promise<string> => {
  const { cloudName, uploadPreset } = CLOUDINARY_CONFIG;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'menu-items');

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

// Generate a placeholder/loading image URL
export const getPlaceholderUrl = (
  width: number = 400,
  height: number = 300,
  text: string = 'Loading...'
): string => {
  const { cloudName } = CLOUDINARY_CONFIG;
  return `https://res.cloudinary.com/${cloudName}/image/upload/w_${width},h_${height},c_fill,b_f0f0f0,co_gray,l_text:Arial_20:${encodeURIComponent(text)}/sample`;
};

// Image component helper - returns srcSet for responsive images
export const getResponsiveImageSrcSet = (publicId: string): string => {
  const sizes = [400, 600, 800, 1200];

  return sizes
    .map((size) => {
      const url = buildCloudinaryUrl(publicId, {
        width: size,
        crop: 'fill',
        gravity: 'auto',
        quality: 'auto',
        format: 'auto',
      });
      return `${url} ${size}w`;
    })
    .join(', ');
};
