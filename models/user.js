import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
const userSchema = new Schema({
  username: { type: String,unique:false },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  roles: [
    {
      organizationId: { type: Schema.Types.ObjectId, ref: "Organization" },
      role: { type: String, enum: ["Admin", "ProjectManager", "Member"] },
    },
  ],
  projects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
  tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
  teams: [{ type: Schema.Types.ObjectId, ref: "Team" }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  plan :{ type:String , enum:["Free","Basic","Business"], default:"Free"},
  resetPasswordToken: String,
  resetPasswordExpires: Date,
},{minimize:false});



userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
