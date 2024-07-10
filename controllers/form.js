import Form from "../models/form.js";
import Response from "../models/response.js";

import { BlobServiceClient } from "@azure/storage-blob";

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_BLOB_CONNECTION_STRING
);
const containerClient = blobServiceClient.getContainerClient(
  process.env.CONTAINER
);

const createBlobInContainer = async (blobName, buffer) => {
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.uploadData(buffer);
  return blockBlobClient.url;
};

const getAll = async (req, res) => {
  const forms = await Form.find({
    createdBy: req.user.user.id,
  });
  res.json(forms);
};

const create = async (req, res) => {
  try {
    const userId = req.user.user.id;
    const form = new Form({
      title: req.body.formSettings.title || "Form",
      description: req.body.formSettings.description||"",
      formElements: req.body.formElements,
      createdBy: userId,
      allowEditAfterSubmission: req.body.formSettings.allowEditAfterSubmission,
      allowMultipleResponses: req.body.formSettings.allowMultipleResponses,
      closeDate: req.body.formSettings.closingDate,
    });

    await form.save();
    res.status(201).send({ message: "Form created successfully", form });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error creating form" });
  }
};

const get = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id).populate({
      path: "responses",
    });

    if (!form) {
      return res.status(404).send({ message: "Form not found" });
    }

    //  increase count of views by 1

    form.views = form.views + 1;

    await form.save();

    res.send(form);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error getting form" });
  }
};

const getResponses = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).send({ message: "Form not found" });
    }

    const responses = await Response.find({ formId: form._id });

    res.send(responses);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error getting responses" });
  }
};

const formSubmission = async (req, res) => {
  try {
    const form = await Form.findById(req.body.formId);
    if (!form) {
      return res.status(404).send({ message: "Form not found" });
    }
    if (form.closeDate && new Date() > new Date(form.closeDate)) {
      return res.status(400).send({ message: "Form submission closed" });
    }

    const response = new Response({
      formId: req.body.formId,
      userId: req.user.user.id,
      responses: [],
    });

    for (let elementId in req.body) {
      if (elementId !== "formId") {
        let element = JSON.parse(req.body[elementId]);
        let value = element.value;
        let label = element.label;

        if (req.file && typeof element.value == typeof {}) {
          const blobName = `${Date.now()}-${req.file.originalname}`;
          const blobUrl = await createBlobInContainer(
            blobName,
            req.file.buffer
          );
          value = blobUrl;
        }

        response.responses.push({ elementId, value, label });
      }
    }

    await response.save();

    form.responses.push(response._id);
    await form.save();

    res.status(201).send({ message: "Form submitted successfully", response });
  } catch (error) {
    console.error("Error submitting form:", error);
    res.status(500).send({ message: "Error submitting form" });
  }
};

export default {
  getAll,
  formSubmission,
  create,
  get,
  getResponses,
};
