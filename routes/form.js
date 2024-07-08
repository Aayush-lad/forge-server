import Form from "../models/form.js";
import authMiddleware from "../middlewares/auth.js"
import Response from "../models/response.js";
import multer from "multer";

// src/server/routes/form.js

import express from "express";
import { BlobServiceClient } from "@azure/storage-blob";

const router = express.Router();



const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_BLOB_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(process.env.CONTAINER);

const createBlobInContainer = async (blobName, buffer) => {
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.uploadData(buffer);
  return blockBlobClient.url;
};




router.get("/all",authMiddleware, async (req, res) => {


    const forms = await Form.find({
        createdBy: req.user.user.id 
    });

    res.json(forms);
});

router.post("/create",authMiddleware, async (req, res) => {
  
  try {
        const userId = req.user.user.id;
        const form = new Form({
          title: "Form",
          description:"Only registered users",
          formElements: req.body.formElements,
            createdBy: userId,
            allowEditAfterSubmission:req.body.formSettings.allowEditAfterSubmission,
            allowMultipleResponses:req.body.formSettings.allowMultipleResponses,
            closeDate: req.body.formSettings.closingDate
        });
    
        await form.save();
        res.status(201).send({ message: 'Form created successfully', form });
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error creating form' });
      }
});

// get form

router.get("/:id", async (req, res) => {
  console.log(req.params.id);
    try {
        const form = await Form.findById(req.params.id).populate(
          {
            path:'responses'
          }
        )

        
        if (!form) {
          return res.status(404).send({ message: 'Form not found' });
        }

        //  increase count of views by 1

        form.views = form.views + 1;

        await form.save();

        res.send(form);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error getting form' });
      }
});

//  get responses of form

router.get("/:id/responses", async (req, res) => {
  console.log(req.params.id);
    try {
        const form = await Form.findById(req.params.id)
        if (!form) {
          return res.status(404).send({ message: 'Form not found' });
        }
        
        const responses = await Response.find({ formId: form._id });
        console.log(responses.length)
        res.send(responses);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error getting responses' });
      }
});



// Multer middleware for handling file uploads to Azure Blob Storage
const upload = multer(); // Initialize Multer

// Route to handle form submission


// Route to handle form submission
router.post('/submit-form', upload.single('file'), authMiddleware, async (req, res) => {

  console.log(req.file);
  try {
    const form = await Form.findById(req.body.formId);
    if (!form) {
      return res.status(404).send({ message: 'Form not found' });
    }
    if (form.closeDate && new Date() > new Date(form.closeDate)) {
      return res.status(400).send({ message: 'Form submission closed' });
    }

    const response = new Response({
      formId: req.body.formId,
      userId: req.user.user.id,
      responses: []
    });

    console.log("REQUEST BODY: ", typeof
      req.body.file);

    for (let elementId in req.body) {
      if (elementId !== 'formId') {
        let element = JSON.parse(req.body[elementId]);
        let value = element.value
        let label = element.label
        console.log(element);
        if (req.file && (typeof element.value == typeof {})) {
        
          const blobName = `${Date.now()}-${req.file.originalname}`;
          const blobUrl = await createBlobInContainer(blobName, req.file.buffer);
          value = blobUrl;
          console.log(blobUrl);
        }
        
        response.responses.push({ elementId, value, label });
      }
    }

    await response.save();

    form.responses.push(response._id);
    await form.save();
    

    res.status(201).send({ message: 'Form submitted successfully', response });
  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).send({ message: 'Error submitting form' });
  }
});



export default router;



