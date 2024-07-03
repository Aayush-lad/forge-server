import mongoose,{Schema} from "mongoose";

const meetingSchema = new Schema({
    callId :{type:String , required:true},
    description: { type: String },
    startDate: { type: Date, required: true},
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    organizationId:{type:Schema.Types.ObjectId,ref:'Organization'},
    status:{type: String , default:"upcoming"}
  });
  
const Meeting = mongoose.model('Meeting', meetingSchema);

export default Meeting;
  