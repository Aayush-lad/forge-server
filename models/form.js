import mongoose from "mongoose";

const formElementSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  label: { type: String, required: true },
  options: { type: [String], default: [] },
  required: { type: Boolean, default: false },

});

const formSchema = new mongoose.Schema({
  createdBy:{type:mongoose.Schema.ObjectId,ref:"User", required:true},
  title: { type: String, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  formElements: [formElementSchema],
  closeDate:{type:Date},
  allowEditAfterSubmission : {type:Boolean, default:false},
  allowEditAfterSubmission:{type:Boolean,default:false},
  responses : [{type:mongoose.Schema.ObjectId, ref:'Response' }],
  views:{type: Number , default:0} 
});


const Form = mongoose.model.Form || mongoose.model('Form', formSchema);

export default Form;
