import mongoose,{Schema} from "mongoose";


const chatMessageSchema = new Schema({
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  });

const ChatMessage  =mongoose.model.ChatMessage || mongoose.model('ChatMessage', chatMessageSchema);

export default ChatMessage;



