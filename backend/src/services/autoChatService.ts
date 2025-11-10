import mongoose from 'mongoose';
import ChatRoom from '../models/ChatRoom';
import MessProfile from '../models/MessProfile';
import User from '../models/User';
import MessMembership from '../models/MessMembership';
import logger from '../utils/logger';

export class AutoChatService {
  /**
   * Create default chat group for a mess when it's created
   */
  static async createDefaultMessGroups(messId: string): Promise<void> {
    try {
      const mess = await MessProfile.findById(messId);
      if (!mess) {
        throw new Error(`Mess with ID ${messId} not found`);
      }

      // Create single default mess group
      const defaultGroup = new ChatRoom({
        name: `${mess.name} - Community`,
        description: `Main community chat for ${mess.name} mess members. Share announcements, discuss meals, and connect with your mess community.`,
        type: 'mess',
        messId: messId,
        createdBy: mess.userId,
        participants: [{
          userId: mess.userId,
          role: 'mess-owner',
          joinedAt: new Date(),
          lastSeen: new Date(),
          isActive: true
        }],
        settings: {
          allowFileUpload: true,
          allowImageUpload: true,
          maxFileSize: 10,
          messageRetentionDays: 90
        },
        isActive: true
      });

      // mark as default group
      defaultGroup.isDefault = true;

      await defaultGroup.save();
      logger.info(`Created default community group for mess ${messId}: ${defaultGroup._id}`);

    } catch (error) {
      logger.error('Error creating default mess group:', error);
      throw error;
    }
  }

  /**
   * Auto-join user to mess chat group when they subscribe
   */
  static async autoJoinUserToMessGroups(userId: string, messId: string): Promise<void> {
    try {
      // Find the active chat group for this mess
      let messGroup = await ChatRoom.findOne({
        messId: messId,
        isActive: true,
        type: 'mess'
      });

      if (!messGroup) {
        logger.warn(`No chat group found for mess ${messId}, creating default group`);
        await this.createDefaultMessGroups(messId);
        // Re-fetch group after creation
        messGroup = await ChatRoom.findOne({
          messId: messId,
          isActive: true,
          type: 'mess'
        });
      }

      if (!messGroup) {
        throw new Error(`Failed to create or find chat group for mess ${messId}`);
      }

      // Get user details
      const user = await User.findById(userId);
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      // Get mess details
      const mess = await MessProfile.findById(messId);
      if (!mess) {
        throw new Error(`Mess with ID ${messId} not found`);
      }

      // Join user to the mess group
      // Check if user is already a participant
      const existingParticipant = messGroup.participants.find(
        p => p.userId.toString() === userId
      );

      if (!existingParticipant) {
        messGroup.participants.push({
          userId: new mongoose.Types.ObjectId(userId),
          role: 'user',
          joinedAt: new Date(),
          lastSeen: new Date(),
          isActive: true
        });

        await messGroup.save();
        logger.info(`User ${userId} auto-joined group ${messGroup.name} (${messGroup._id})`);
      }

    } catch (error) {
      logger.error('Error auto-joining user to mess groups:', error);
      throw error;
    }
  }

  /**
   * Remove user from ALL mess chat groups when they leave the mess
   * Removes from: mess, mess-group, announcements, meal-discussions types
   */
  static async removeUserFromMessGroups(userId: string, messId: string): Promise<void> {
    try {
      // Find ALL active chat groups for this mess (all types)
      const messGroups = await ChatRoom.find({
        messId: messId,
        isActive: true,
        type: { $in: ['mess', 'mess-group', 'announcements', 'meal-discussions'] }
      });

      if (messGroups.length === 0) {
        logger.info(`No chat groups found for mess ${messId} to remove user ${userId} from`);
        return;
      }

      // Remove user from all groups
      let removedCount = 0;
      for (const group of messGroups) {
        const beforeCount = group.participants.length;
        group.participants = group.participants.filter(
          p => p.userId.toString() !== userId
        );
        
        if (group.participants.length < beforeCount) {
          await group.save();
          removedCount++;
          logger.info(`User ${userId} removed from group ${group.name} (${group._id}) of type ${group.type}`);
        }
      }

      logger.info(`User ${userId} removed from ${removedCount} chat group(s) for mess ${messId}`);

    } catch (error) {
      logger.error('Error removing user from mess groups:', error);
      throw error;
    }
  }

  /**
   * Create chat group for existing messes that don't have one
   */
  static async createGroupsForExistingMesses(): Promise<void> {
    try {
      const messes = await MessProfile.find({ isActive: true });
      
      for (const mess of messes) {
        const existingGroup = await ChatRoom.findOne({
          messId: mess._id,
          type: 'mess'
        });

        if (!existingGroup) {
          await this.createDefaultMessGroups(mess._id.toString());
          logger.info(`Created default group for existing mess: ${mess.name}`);
        }
      }

    } catch (error) {
      logger.error('Error creating group for existing messes:', error);
      throw error;
    }
  }
}
