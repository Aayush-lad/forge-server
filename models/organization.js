import mongoose from 'mongoose';

const { Schema } = mongoose;

const organizationSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  teams: [{ type: Schema.Types.ObjectId, ref: 'Team' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  
});

const Organization = mongoose.models.Organization || mongoose.model('Organization', organizationSchema);

export default Organization;
