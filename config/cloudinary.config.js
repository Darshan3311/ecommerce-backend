const cloudinary = require('cloudinary').v2;

class CloudinaryConfig {
  static configure() {
    // Support an all-in-one CLOUDINARY_URL (cloudinary://API_KEY:API_SECRET@CLOUD_NAME)
    // which is convenient for hosting platforms like Render, and fall back to
    // individual env vars when not present.
    const cloudinaryUrl = process.env.CLOUDINARY_URL;
    const config = {};

    if (cloudinaryUrl) {
      // Let cloudinary.parse or cloudinary.config handle the URL
      try {
        cloudinary.config({ url: cloudinaryUrl, secure: true });
        console.log('✅ Cloudinary configured from CLOUDINARY_URL');
        return;
      } catch (err) {
        console.warn('⚠ Failed to configure Cloudinary from CLOUDINARY_URL, falling back to individual vars');
      }
    }

    config.cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
    config.api_key = process.env.CLOUDINARY_API_KEY;
    config.api_secret = process.env.CLOUDINARY_API_SECRET;
    config.secure = true;

    if (!config.cloud_name || !config.api_key || !config.api_secret) {
      console.warn('⚠ Cloudinary environment variables are missing or incomplete. Image uploads will fail until CLOUDINARY_URL or individual keys are set.');
    }

    cloudinary.config(config);
    console.log('✅ Cloudinary configured (from individual env vars if provided)');
  }

  static async uploadImage(file, folder = 'ecommerce') {
    try {
      const result = await cloudinary.uploader.upload(file, {
        folder: folder,
        resource_type: 'auto',
        transformation: [
          { width: 1000, height: 1000, crop: 'limit' },
          { quality: 'auto' }
        ]
      });

      return {
        public_id: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height
      };
    } catch (error) {
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }

  static async deleteImage(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      throw new Error(`Image deletion failed: ${error.message}`);
    }
  }

  static async uploadMultipleImages(files, folder = 'ecommerce') {
    try {
      const uploadPromises = files.map(file => this.uploadImage(file, folder));
      return await Promise.all(uploadPromises);
    } catch (error) {
      throw new Error(`Multiple image upload failed: ${error.message}`);
    }
  }
}

module.exports = CloudinaryConfig;
