const cloudinary = require('cloudinary').v2;

class CloudinaryConfig {
  static configure() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    });

    console.log('✅ Cloudinary configured successfully');
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
