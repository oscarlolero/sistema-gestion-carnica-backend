import { Controller, Delete, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';

@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Delete('image')
  @HttpCode(HttpStatus.OK)
  async deleteImage(@Body('imageUrl') imageUrl: string) {
    if (!imageUrl) {
      return { success: false, message: 'Image URL is required' };
    }

    try {
      const result = await this.cloudinaryService.deleteImage(imageUrl);
      return { success: true, result };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to delete image',
      };
    }
  }
}
