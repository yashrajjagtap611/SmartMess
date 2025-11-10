import express from 'express';
import { Poll } from '../models/Poll';
import ChatRoom from '../models/ChatRoom';
import requireAuth from '../middleware/requireAuth';
import { authLimiter } from '../middleware/rateLimiter';

const router: express.Router = express.Router();

// Apply rate limiting to all poll routes
router.use(authLimiter);

// Create a new poll
router.post('/', requireAuth, async (req: any, res: any) => {
  try {
    const { question, options, roomId, expiresAt } = req.body;
    const userId = req.user?.id;

    if (!question || !options || !roomId) {
      return res.status(400).json({
        success: false,
        message: 'Question, options, and roomId are required'
      });
    }

    if (options.length < 2 || options.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'Poll must have between 2 and 10 options'
      });
    }

    // Check if room exists and user has access
    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found'
      });
    }

    // Check if user is a participant in the room
    const isParticipant = room.participants.some(
      (participant: any) => participant.userId.toString() === userId
    );
    
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this room'
      });
    }

    // Only mess owners and admins can create polls
    const userRole = room.participants.find(
      (participant: any) => participant.userId.toString() === userId
    )?.role;

    if (userRole !== 'mess-owner' && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only mess owners and admins can create polls'
      });
    }

    // Create poll options with unique IDs
    const pollOptions = options.map((text: string, index: number) => ({
      id: `option_${index}`,
      text: text.trim(),
      votes: 0,
      voters: []
    }));

    const poll = new Poll({
      question: question.trim(),
      options: pollOptions,
      roomId,
      createdBy: userId,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    });

    await poll.save();

    // Populate the createdBy field
    await poll.populate('createdBy', 'firstName lastName email');

    const pollData = {
      ...poll.toObject(),
      id: poll._id.toString(),
      createdBy: poll.createdBy._id ? poll.createdBy._id.toString() : poll.createdBy.toString()
    };

    // Broadcast poll creation to all users in the room
    const wsService = (global as any).websocketService;
    if (wsService) {
      wsService.broadcastPollCreated(roomId, pollData);
    }

    res.status(201).json({
      success: true,
      message: 'Poll created successfully',
      data: pollData
    });
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create poll'
    });
  }
});

// Get polls for a room
router.get('/room/:roomId', requireAuth, async (req: any, res: any) => {
  try {
    const { roomId } = req.params;
    const userId = req.user?.id;

    // Check if room exists and user has access
    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found'
      });
    }

    // Check if user is a participant in the room
    const isParticipant = room.participants.some(
      (participant: any) => participant.userId.toString() === userId
    );
    
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this room'
      });
    }

    const polls = await Poll.find({ roomId })
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    // Transform polls to include id field and ensure createdBy is a string
    const transformedPolls = polls.map(poll => ({
      ...poll.toObject(),
      id: poll._id.toString(),
      createdBy: poll.createdBy._id ? poll.createdBy._id.toString() : poll.createdBy.toString()
    }));

    res.json({
      success: true,
      data: transformedPolls
    });
  } catch (error) {
    console.error('Error fetching polls:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch polls'
    });
  }
});

// Vote on a poll
router.post('/:pollId/vote', requireAuth, async (req: any, res: any) => {
  try {
    const { pollId } = req.params;
    const { optionId } = req.body;
    const userId = req.user?.id;

    if (!optionId) {
      return res.status(400).json({
        success: false,
        message: 'Option ID is required'
      });
    }

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    // Check if poll is active
    if (!poll.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Poll is not active'
      });
    }

    // Check if poll has expired
    if (poll.expiresAt && new Date() > poll.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'Poll has expired'
      });
    }

    // Check if option exists
    const option = poll.options.find(opt => opt.id === optionId);
    if (!option) {
      return res.status(400).json({
        success: false,
        message: 'Invalid option'
      });
    }

    // Check if user has already voted
    const hasVoted = poll.options.some(opt => opt.voters.includes(userId));
    const previousVote = poll.options.find(opt => opt.voters.includes(userId));

    if (hasVoted && previousVote?.id !== optionId) {
      // User is changing their vote
      // Remove vote from previous option
      const previousOption = poll.options.find(opt => opt.id === previousVote?.id);
      if (previousOption) {
        previousOption.votes -= 1;
        previousOption.voters = previousOption.voters.filter(
          voterId => voterId.toString() !== userId
        );
      }

      // Add vote to new option
      option.votes += 1;
      option.voters.push(userId);
    } else if (!hasVoted) {
      // User is voting for the first time
      option.votes += 1;
      option.voters.push(userId);
    } else {
      // User clicked the same option - no change needed
      return res.json({
        success: true,
        message: 'Vote unchanged',
        data: {
          ...poll.toObject(),
          id: poll._id.toString(),
          createdBy: poll.createdBy._id ? poll.createdBy._id.toString() : poll.createdBy.toString()
        }
      });
    }

    await poll.save();

    res.json({
      success: true,
      message: 'Vote recorded successfully',
      data: {
        ...poll.toObject(),
        id: poll._id.toString(),
        createdBy: poll.createdBy._id ? poll.createdBy._id.toString() : poll.createdBy.toString()
      }
    });
  } catch (error) {
    console.error('Error voting on poll:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to vote on poll'
    });
  }
});

// Close a poll
router.patch('/:pollId/close', requireAuth, async (req: any, res: any) => {
  try {
    const { pollId } = req.params;
    const userId = req.user?.id;

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    // Check if user is the creator or has admin privileges
    if (poll.createdBy.toString() !== userId) {
      // Check if user is admin in the room
      const room = await ChatRoom.findById(poll.roomId);
      const userRole = room?.participants.find(
        (participant: any) => participant.userId.toString() === userId
      )?.role;

      if (userRole !== 'admin' && userRole !== 'mess-owner') {
        return res.status(403).json({
          success: false,
          message: 'Only poll creator or admins can close polls'
        });
      }
    }

    poll.isActive = false;
    await poll.save();

    res.json({
      success: true,
      message: 'Poll closed successfully',
      data: {
        ...poll.toObject(),
        id: poll._id.toString(),
        createdBy: poll.createdBy._id ? poll.createdBy._id.toString() : poll.createdBy.toString()
      }
    });
  } catch (error) {
    console.error('Error closing poll:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to close poll'
    });
  }
});

// Update a poll
router.put('/:pollId', requireAuth, async (req: any, res: any) => {
  try {
    const { pollId } = req.params;
    const { question, options, expiresAt } = req.body;
    const userId = req.user?.id;

    if (!question || !options) {
      return res.status(400).json({
        success: false,
        message: 'Question and options are required'
      });
    }

    if (options.length < 2 || options.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'Poll must have between 2 and 10 options'
      });
    }

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    // Check if user is the creator or has admin privileges
    if (poll.createdBy.toString() !== userId) {
      // Check if user is admin in the room
      const room = await ChatRoom.findById(poll.roomId);
      const userRole = room?.participants.find(
        (participant: any) => participant.userId.toString() === userId
      )?.role;

      if (userRole !== 'admin' && userRole !== 'mess-owner') {
        return res.status(403).json({
          success: false,
          message: 'Only poll creator or admins can edit polls'
        });
      }
    }

    // Allow full editing regardless of votes
    poll.question = question.trim();
    
    // Update options - preserve existing votes and voters
    const updatedOptions = options.map((text: string, index: number) => {
      const existingOption = poll.options.find(opt => opt.id === `option_${index}`);
      return {
        id: `option_${index}`,
        text: text.trim(),
        votes: existingOption ? existingOption.votes : 0,
        voters: existingOption ? existingOption.voters : []
      };
    });
    
    // If we're adding new options, add them with 0 votes
    for (let i = poll.options.length; i < options.length; i++) {
      updatedOptions.push({
        id: `option_${i}`,
        text: options[i].trim(),
        votes: 0,
        voters: []
      });
    }
    
    poll.options = updatedOptions;
    poll.expiresAt = expiresAt ? new Date(expiresAt) : undefined as any;

    await poll.save();

    const pollData = {
      ...poll.toObject(),
      id: poll._id.toString(),
      createdBy: poll.createdBy._id ? poll.createdBy._id.toString() : poll.createdBy.toString()
    };

    // Broadcast poll update to all users in the room
    const wsService = (global as any).websocketService;
    if (wsService) {
      wsService.broadcastPollUpdate(poll.roomId.toString(), pollData);
    }

    res.json({
      success: true,
      message: 'Poll updated successfully',
      data: pollData
    });
  } catch (error) {
    console.error('Error updating poll:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update poll'
    });
  }
});

// Delete a poll
router.delete('/:pollId', requireAuth, async (req: any, res: any) => {
  try {
    const { pollId } = req.params;
    const userId = req.user?.id;

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    // Check if user is the creator or has admin privileges
    if (poll.createdBy.toString() !== userId) {
      // Check if user is admin in the room
      const room = await ChatRoom.findById(poll.roomId);
      const userRole = room?.participants.find(
        (participant: any) => participant.userId.toString() === userId
      )?.role;

      if (userRole !== 'admin' && userRole !== 'mess-owner') {
        return res.status(403).json({
          success: false,
          message: 'Only poll creator or admins can delete polls'
        });
      }
    }

    // Get room ID before deleting
    const roomId = poll.roomId.toString();
    
    await Poll.findByIdAndDelete(pollId);

    // Broadcast poll deletion to all users in the room
    const wsService = (global as any).websocketService;
    if (wsService) {
      wsService.broadcastPollDeleted(roomId, pollId);
    }

    res.json({
      success: true,
      message: 'Poll deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting poll:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete poll'
    });
  }
});

export default router;
