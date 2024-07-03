import mongoose from 'mongoose';
const { Schema } = mongoose;

const messageSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  chatRoom: { type: Schema.Types.ObjectId, ref: 'ChatRoom', required: true },
  type: { type: String, default: 'text' },
});

const chatRoomSchema = new Schema({
  name: { type: String },
  members: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  isPrivate: { type: Boolean, default: false },
  projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
  teamId: { type: Schema.Types.ObjectId, ref: 'Team' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);
const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);



export {
  Message,
  ChatRoom,
};