import mongoose,{Schema} from "mongoose";

const teamSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  });
  
  
  const Team = mongoose.models.Team || mongoose.model('Team',teamSchema);

  export default Team;
  