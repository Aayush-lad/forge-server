import mongoose,{Schema} from 'mongoose';


const projectSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    status: { type: String, enum: ['Not Started', 'In Progress', 'Completed'], default: 'Not Started' },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    tasks:[{type: Schema.Types.ObjectId,ref:'Task'}],
    teamId: [{ type: Schema.Types.ObjectId, ref: 'Team', required: true }],
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });
  
const Project = mongoose.model.Project || mongoose.model('Project', projectSchema);

export default Project;
  