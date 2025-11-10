import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import config from '../config';
import logger from '../utils/logger';

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

// Upload image to Cloudinary
export const uploadImage = async (filePath: string, folder: string = 'SmartMess'): Promise<string> => {
  try {
    logger.info(`Uploading image to Cloudinary: ${filePath}`);
    
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'auto',
      transformation: [
        { width: 800, height: 600, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    logger.info(`Image uploaded successfully: ${result.secure_url}`);
    
    // Delete local file after upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.debug(`Local file deleted: ${filePath}`);
    }

    return result.secure_url;
  } catch (error) {
    logger.error('Error uploading image to Cloudinary:', error);
    throw new Error('Failed to upload image');
  }
};

// Delete image from Cloudinary
export const deleteImage = async (publicId: string): Promise<void> => {
  try {
    logger.info(`Deleting image from Cloudinary: ${publicId}`);
    
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      logger.info(`Image deleted successfully: ${publicId}`);
    } else {
      logger.warn(`Image deletion may have failed: ${publicId}`);
    }
  } catch (error) {
    logger.error('Error deleting image from Cloudinary:', error);
    throw new Error('Failed to delete image');
  }
};

// Upload multer file to Cloudinary
export const uploadMulterFile = async (file: Express.Multer.File, folder: string = 'SmartMess'): Promise<{ secure_url: string }> => {
  try {
    logger.info(`Uploading multer file to Cloudinary: ${file.originalname}`);
    
    // Create a temporary file path
    const tempFilePath = path.join(__dirname, '../../uploads', `temp_${Date.now()}_${file.originalname}`);
    
    // Ensure uploads directory exists
    const uploadsDir = path.dirname(tempFilePath);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Write buffer to temporary file
    fs.writeFileSync(tempFilePath, file.buffer);
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(tempFilePath, {
      folder,
      resource_type: 'auto',
      transformation: [
        { width: 800, height: 600, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    logger.info(`File uploaded successfully: ${result.secure_url}`);
    
    // Delete temporary file
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
      logger.debug(`Temporary file deleted: ${tempFilePath}`);
    }

    return result;
  } catch (error) {
    logger.error('Error uploading multer file to Cloudinary:', error);
    throw new Error('Failed to upload file');
  }
};

// Get public ID from URL
export const getPublicIdFromUrl = (url: string): string | null => {
  try {
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1];
    const publicId = filename?.split('.')[0];
    return publicId || null;
  } catch (error) {
    logger.error('Error extracting public ID from URL:', error);
    return null;
  }
};

export default {
  uploadImage,
  deleteImage,
  getPublicIdFromUrl,
  uploadMulterFile,
}; 