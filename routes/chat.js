import express from 'express';
const router = express.Router();
import authMiddleware from '../middlewares/auth.js'
import {ChatRoom,Message} from '../models/chat.js'


router.get('/chat-rooms', authMiddleware, async (req, res) => {
  console.log(req.user.user.id);
  try {
    const chatRooms = await ChatRoom.find({ members: req.user.user.id });
    res.json(chatRooms);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/:chatRoomId/messages', authMiddleware, async (req, res) => {
  try {
    const chatRoom = await ChatRoom.findById(req.params.chatRoomId);
    if (!chatRoom) {
      return res.status(404).json({ message: 'ChatRoom not found' });
    }
    const messages = await Message.find({chatRoom:chatRoom._id});    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



export default router;
