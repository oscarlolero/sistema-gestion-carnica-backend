import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {
    // Cloudinary is configured via CLOUDINARY_URL environment variable
    // Format: cloudinary://api_key:api_secret@cloud_name
    if (!process.env.CLOUDINARY_URL) {
      console.warn('CLOUDINARY_URL not set. Image operations will not work.');
    }
  }

  /**
   * Extract public_id from Cloudinary URL
   * Example: https://res.cloudinary.com/dojzr8wxw/image/upload/v123/products/image.jpg
   * Returns: products/image
   */
  private extractPublicId(imageUrl: string): string | null {
    try {
      const regex = /\/upload\/(?:v\d+\/)?(.+)\.\w+$/;
      const match = imageUrl.match(regex);
      return match ? match[1] : null;
    } catch (error) {
      console.error('Error extracting public_id:', error);
      return null;
    }
  }

  /**
   * Delete an image from Cloudinary
   * @param imageUrl - The full Cloudinary URL of the image
   * @returns Result of the deletion
   */
  async deleteImage(imageUrl: string): Promise<{ result: string }> {
    try {
      const publicId = this.extractPublicId(imageUrl);
      
      if (!publicId) {
        throw new Error('Invalid Cloudinary URL');
      }

      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'image',
      });

      return result;
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
      throw error;
    }
  }

  /**
   * Delete multiple images from Cloudinary
   * @param imageUrls - Array of Cloudinary URLs
   * @returns Results of the deletions
   */
  async deleteImages(imageUrls: string[]): Promise<any[]> {
    const deletePromises = imageUrls.map((url) => this.deleteImage(url));
    return Promise.all(deletePromises);
  }
}
