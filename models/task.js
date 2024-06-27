import mongoose,{Schema} from "mongoose";
const taskSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['To Do', 'In Progress', 'Completed'], default: 'To Do' },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    assignees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    dependencies: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
    startDate: { type: Date },
    endDate: { type: Date },
    timeLogged: { type: Number, default: 0 }, // in hours
    comments: [{
      userId: { type: Schema.Types.ObjectId, ref: 'User' },
      comment: { type: String },
      createdAt: { type: Date, default: Date.now }
    }],
    attachments: [{
      fileName: { type: String },
      fileUrl: { type: String }
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });
  
  
  const Task = mongoose.models.Task || mongoose.model('Task',taskSchema);
  export default Task;