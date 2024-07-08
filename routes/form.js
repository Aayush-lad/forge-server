import express from "express";
import formController from "../controllers/form.js";
import authMiddleware from "../middlewares/auth.js"
import multer from "multer";



const router = express.Router();
router.get("/all",authMiddleware,formController.getAll) ;
router.post("/create",authMiddleware,formController.create);
router.get("/:id",formController.get );
router.get("/:id/responses",formController.getResponses );
const upload = multer(); 
router.post('/submit-form', upload.single('file'), authMiddleware,formController.formSubmission);



export default router;



