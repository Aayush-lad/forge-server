import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Define a schema for form responses
const FormResponseSchema = new Schema({
  formId: {
    type: Schema.Types.ObjectId,
    ref: 'Form', // Reference to the Form schema
    required: true
  },
  responses: [{
    elementId: {
      type: Schema.Types.String, // Reference to the FormElement schema or directly embed element details
      required: true
    },
    value: {
      type: Schema.Types.Mixed
      , // Store various types of values based on element type (text, file, checkbox, etc.)
      required: true
    },
    label:{
      type: Schema.Types.String,
      required: true
    }
  }],
  submittedAt: {
    type: Date,
    default: Date.now
  },

  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User' // Reference to the User schema
  }
});

const Response = mongoose.model('Response', FormResponseSchema);

export default Response;
