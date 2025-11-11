"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessController = void 0;
const MessProfile_1 = __importDefault(require("../models/MessProfile"));
const logger_1 = __importDefault(require("../utils/logger"));
class MessController {
    // Get mess profile
    static async getProfile(req, res) {
        try {
            const userId = req.user?._id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                    code: 'UNAUTHORIZED'
                });
            }
            // Find profile in database
            const profile = await MessProfile_1.default.findOne({ userId });
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
        }
        catch (error) {
            logger_1.default.error('Get mess profile error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch mess profile',
                code: 'PROFILE_FETCH_ERROR'
            });
        }
    }
    // Create or update mess profile
    static async createOrUpdateProfile(req, res) {
        try {
            const userId = req.user?._id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                    code: 'UNAUTHORIZED'
                });
            }
            const profileData = req.body;
            // Check if profile already exists
            const existingProfile = await MessProfile_1.default.findOne({ userId });
            if (existingProfile) {
                // Update existing profile
                logger_1.default.info('Updating existing mess profile:', { userId });
                // Prepare update data
                const updateFields = {};
                if (profileData.name !== undefined) {
                    updateFields.name = profileData.name.trim();
                }
                if (profileData.location !== undefined) {
                    updateFields.location = {
                        street: profileData.location.street?.trim() || '',
                        city: profileData.location.city?.trim() || '',
                        district: profileData.location.district?.trim() || '',
                        state: profileData.location.state?.trim() || '',
                        pincode: profileData.location.pincode?.trim() || '',
                        country: profileData.location.country?.trim() || 'India'
                    };
                }
                if (profileData.colleges !== undefined) {
                    updateFields.colleges = profileData.colleges
                        .map((college) => college.trim())
                        .filter((college) => college.length > 0);
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
                    updateFields.operatingHours = profileData.operatingHours;
                }
                // Update in database
                const updatedProfile = await MessProfile_1.default.findOneAndUpdate({ userId }, updateFields, { new: true, runValidators: true });
                return res.status(200).json({
                    success: true,
                    message: 'Mess profile updated successfully',
                    data: {
                        name: updatedProfile.name,
                        location: updatedProfile.location,
                        colleges: updatedProfile.colleges,
                        ownerPhone: updatedProfile.ownerPhone,
                        ownerEmail: updatedProfile.ownerEmail,
                        types: updatedProfile.types,
                        logo: updatedProfile.logo,
                        operatingHours: updatedProfile.operatingHours
                    }
                });
            }
            else {
                // Create new profile
                logger_1.default.info('Creating new mess profile:', { userId });
                // Create new profile
                const newProfile = new MessProfile_1.default({
                    userId,
                    name: profileData.name.trim(),
                    location: {
                        street: profileData.location.street?.trim() || '',
                        city: profileData.location.city.trim(),
                        district: profileData.location.district?.trim() || '',
                        state: profileData.location.state.trim(),
                        pincode: profileData.location.pincode.trim(),
                        country: profileData.location.country?.trim() || 'India'
                    },
                    colleges: profileData.colleges
                        .map((college) => college.trim())
                        .filter((college) => college.length > 0),
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
                    const { AutoChatService } = await Promise.resolve().then(() => __importStar(require('../services/autoChatService')));
                    // Ensure we call the create function asynchronously
                    AutoChatService.createDefaultMessGroups(savedProfile._id.toString()).catch(err => {
                        logger_1.default.error('Failed to create default chat group for mess:', err);
                    });
                }
                catch (err) {
                    logger_1.default.error('Failed to schedule default chat group creation:', err);
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
        }
        catch (error) {
            logger_1.default.error('Create/Update mess profile error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to create/update mess profile',
                code: 'PROFILE_UPDATE_ERROR'
            });
        }
    }
    // Update mess profile
    static async updateProfile(req, res) {
        try {
            const userId = req.user?._id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                    code: 'UNAUTHORIZED'
                });
            }
            const updateData = req.body;
            // Find existing profile
            const existingProfile = await MessProfile_1.default.findOne({ userId });
            if (!existingProfile) {
                return res.status(404).json({
                    success: false,
                    message: 'Mess profile not found',
                    code: 'PROFILE_NOT_FOUND'
                });
            }
            // Prepare update data
            const updateFields = {};
            if (updateData.name !== undefined) {
                updateFields.name = updateData.name.trim();
            }
            if (updateData.location !== undefined) {
                updateFields.location = {
                    street: updateData.location.street?.trim() || '',
                    city: updateData.location.city?.trim() || '',
                    district: updateData.location.district?.trim() || '',
                    state: updateData.location.state?.trim() || '',
                    pincode: updateData.location.pincode?.trim() || '',
                    country: updateData.location.country?.trim() || 'India'
                };
            }
            if (updateData.colleges !== undefined) {
                updateFields.colleges = updateData.colleges
                    .map((college) => college.trim())
                    .filter((college) => college.length > 0);
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
                updateFields.operatingHours = updateData.operatingHours;
            }
            // Update in database
            const updatedProfile = await MessProfile_1.default.findOneAndUpdate({ userId }, updateFields, { new: true, runValidators: true });
            return res.status(200).json({
                success: true,
                message: 'Mess profile updated successfully',
                data: {
                    name: updatedProfile.name,
                    location: updatedProfile.location,
                    colleges: updatedProfile.colleges,
                    ownerPhone: updatedProfile.ownerPhone,
                    ownerEmail: updatedProfile.ownerEmail,
                    types: updatedProfile.types,
                    logo: updatedProfile.logo,
                    operatingHours: updatedProfile.operatingHours
                }
            });
        }
        catch (error) {
            logger_1.default.error('Update mess profile error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to update mess profile',
                code: 'PROFILE_UPDATE_ERROR'
            });
        }
    }
    // Delete mess profile
    static async deleteProfile(req, res) {
        try {
            const userId = req.user?._id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                    code: 'UNAUTHORIZED'
                });
            }
            const existingProfile = await MessProfile_1.default.findOne({ userId });
            if (!existingProfile) {
                return res.status(404).json({
                    success: false,
                    message: 'Mess profile not found',
                    code: 'PROFILE_NOT_FOUND'
                });
            }
            await MessProfile_1.default.deleteOne({ userId });
            logger_1.default.info('Mess profile deleted successfully:', { userId });
            return res.status(200).json({
                success: true,
                message: 'Mess profile deleted successfully'
            });
        }
        catch (error) {
            logger_1.default.error('Delete mess profile error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to delete mess profile',
                code: 'PROFILE_DELETE_ERROR'
            });
        }
    }
}
exports.MessController = MessController;
exports.default = MessController;
//# sourceMappingURL=messController.js.map