import { Request, Response } from 'express';
import MessProfile from '../models/MessProfile';
import logger from '../utils/logger';
import { IMessProfile } from '../types';

interface AuthRequest extends Request {
  user?: any;
}

export class MessController {
  // Get mess profile
  static async getProfile(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as AuthRequest).user?._id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
          code: 'UNAUTHORIZED'
        });
      }

      // Find profile in database
      const profile = await MessProfile.findOne({ userId });
      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Mess profile not found',
          code: 'PROFILE_NOT_FOUND'
        });
      }

      // Return profile data
      return res.status(200).json({
        success: true,
        message: 'Mess profile fetched successfully',
        data: {
          _id: profile._id,
          name: profile.name,
          location: profile.location,
          colleges: profile.colleges,
          ownerPhone: profile.ownerPhone,
          ownerEmail: profile.ownerEmail,
          types: profile.types,
          logo: profile.logo,
          operatingHours: profile.operatingHours
        }
      });
    } catch (error) {
      logger.error('Get mess profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch mess profile',
        code: 'PROFILE_FETCH_ERROR'
      });
    }
  }

  // Create or update mess profile
  static async createOrUpdateProfile(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as AuthRequest).user?._id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
          code: 'UNAUTHORIZED'
        });
      }

      const profileData = req.body;

      // Check if profile already exists
      const existingProfile = await MessProfile.findOne({ userId });

      if (existingProfile) {
        // Update existing profile
        logger.info('Updating existing mess profile:', { userId });

        // Prepare update data
        const updateFields: Partial<IMessProfile> = {};

        if (profileData.name !== undefined) {
          updateFields.name = profileData.name.trim();
        }

        if (profileData.location !== undefined) {
          (updateFields as any).location = {
            street: profileData.location.street?.trim() || '',
            city: profileData.location.city?.trim() || '',
            district: (profileData.location as any).district?.trim() || '',
            state: profileData.location.state?.trim() || '',
            pincode: profileData.location.pincode?.trim() || '',
            country: profileData.location.country?.trim() || 'India'
          };
        }

        if (profileData.colleges !== undefined) {
          updateFields.colleges = profileData.colleges
            .map((college: string) => college.trim())
            .filter((college: string) => college.length > 0);
        }

        if (profileData.ownerPhone !== undefined) {
          updateFields.ownerPhone = profileData.ownerPhone.trim();
        }

        if (profileData.ownerEmail !== undefined) {
          updateFields.ownerEmail = profileData.ownerEmail.trim().toLowerCase();
        }

        if (profileData.types !== undefined) {
          updateFields.types = profileData.types;
        }

        if (profileData.logo !== undefined) {
          updateFields.logo = profileData.logo;
        }

        if (profileData.operatingHours !== undefined) {
          (updateFields as any).operatingHours = profileData.operatingHours;
        }

        // Update in database
        const updatedProfile = await MessProfile.findOneAndUpdate(
          { userId },
          updateFields,
          { new: true, runValidators: true }
        );

        return res.status(200).json({
          success: true,
          message: 'Mess profile updated successfully',
          data: {
            name: updatedProfile!.name,
            location: updatedProfile!.location,
            colleges: updatedProfile!.colleges,
            ownerPhone: updatedProfile!.ownerPhone,
            ownerEmail: updatedProfile!.ownerEmail,
            types: updatedProfile!.types,
            logo: updatedProfile!.logo,
            operatingHours: updatedProfile!.operatingHours
          }
        });
      } else {
        // Create new profile
        logger.info('Creating new mess profile:', { userId });

        // Create new profile
        const newProfile = new MessProfile({
          userId,
          name: profileData.name.trim(),
          location: {
            street: profileData.location.street?.trim() || '',
            city: profileData.location.city.trim(),
            district: (profileData.location as any).district?.trim() || '',
            state: profileData.location.state.trim(),
            pincode: profileData.location.pincode.trim(),
            country: profileData.location.country?.trim() || 'India'
          } as any,
          colleges: profileData.colleges
            .map((college: string) => college.trim())
            .filter((college: string) => college.length > 0),
          ownerPhone: profileData.ownerPhone?.trim() || '',
          ownerEmail: profileData.ownerEmail.trim().toLowerCase(),
          types: profileData.types,
          logo: profileData.logo || null,
          operatingHours: profileData.operatingHours || []
        });

        // Save to database
        const savedProfile = await newProfile.save();

        // Create default chat group for this mess
        try {
          const { AutoChatService } = await import('../services/autoChatService');
          // Ensure we call the create function asynchronously
          AutoChatService.createDefaultMessGroups(savedProfile._id.toString()).catch(err => {
            logger.error('Failed to create default chat group for mess:', err);
          });
        } catch (err) {
          logger.error('Failed to schedule default chat group creation:', err);
        }

        return res.status(201).json({
          success: true,
          message: 'Mess profile created successfully',
          data: {
            name: savedProfile.name,
            location: savedProfile.location,
            colleges: savedProfile.colleges,
            ownerPhone: savedProfile.ownerPhone,
            ownerEmail: savedProfile.ownerEmail,
            types: savedProfile.types,
            logo: savedProfile.logo,
            operatingHours: savedProfile.operatingHours
          }
        });
      }
    } catch (error) {
      logger.error('Create/Update mess profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create/update mess profile',
        code: 'PROFILE_UPDATE_ERROR'
      });
    }
  }

  // Update mess profile
  static async updateProfile(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as AuthRequest).user?._id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
          code: 'UNAUTHORIZED'
        });
      }

      const updateData = req.body;

      // Find existing profile
      const existingProfile = await MessProfile.findOne({ userId });
      if (!existingProfile) {
        return res.status(404).json({
          success: false,
          message: 'Mess profile not found',
          code: 'PROFILE_NOT_FOUND'
        });
      }

      // Prepare update data
      const updateFields: Partial<IMessProfile> = {};

      if (updateData.name !== undefined) {
        updateFields.name = updateData.name.trim();
      }

      if (updateData.location !== undefined) {
                  (updateFields as any).location = {
            street: updateData.location.street?.trim() || '',
            city: updateData.location.city?.trim() || '',
            district: (updateData.location as any).district?.trim() || '',
            state: updateData.location.state?.trim() || '',
            pincode: updateData.location.pincode?.trim() || '',
            country: updateData.location.country?.trim() || 'India'
          };
      }

      if (updateData.colleges !== undefined) {
        updateFields.colleges = updateData.colleges
          .map((college: string) => college.trim())
          .filter((college: string) => college.length > 0);
      }

      if (updateData.ownerPhone !== undefined) {
        updateFields.ownerPhone = updateData.ownerPhone.trim();
      }

      if (updateData.ownerEmail !== undefined) {
        updateFields.ownerEmail = updateData.ownerEmail.trim().toLowerCase();
      }

      if (updateData.types !== undefined) {
        updateFields.types = updateData.types;
      }

      if (updateData.logo !== undefined) {
        updateFields.logo = updateData.logo;
      }

      if (updateData.operatingHours !== undefined) {
        (updateFields as any).operatingHours = updateData.operatingHours;
      }

      // Update in database
      const updatedProfile = await MessProfile.findOneAndUpdate(
        { userId },
        updateFields,
        { new: true, runValidators: true }
      );

      return res.status(200).json({
        success: true,
        message: 'Mess profile updated successfully',
        data: {
          name: updatedProfile!.name,
          location: updatedProfile!.location,
          colleges: updatedProfile!.colleges,
          ownerPhone: updatedProfile!.ownerPhone,
          ownerEmail: updatedProfile!.ownerEmail,
          types: updatedProfile!.types,
          logo: updatedProfile!.logo,
          operatingHours: updatedProfile!.operatingHours
        }
      });
    } catch (error) {
      logger.error('Update mess profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update mess profile',
        code: 'PROFILE_UPDATE_ERROR'
      });
    }
  }

  // Delete mess profile
  static async deleteProfile(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as AuthRequest).user?._id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
          code: 'UNAUTHORIZED'
        });
      }

      const existingProfile = await MessProfile.findOne({ userId });
      if (!existingProfile) {
        return res.status(404).json({
          success: false,
          message: 'Mess profile not found',
          code: 'PROFILE_NOT_FOUND'
        });
      }

      await MessProfile.deleteOne({ userId });

      logger.info('Mess profile deleted successfully:', { userId });

      return res.status(200).json({
        success: true,
        message: 'Mess profile deleted successfully'
      });
    } catch (error) {
      logger.error('Delete mess profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete mess profile',
        code: 'PROFILE_DELETE_ERROR'
      });
    }
  }
}

export default MessController;