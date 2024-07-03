import express from  "express";
import authMiddleware from "../middlewares/auth.js"
import Meeting from "../models/meeting.js";
const router = express.Router();


router.post("/add-meeting",authMiddleware, async(req,res)=>{
  console.log("add meeting");
  const {startsAt,description,callId,participants,organizationId} = req.body;
  const meeting = await Meeting.create({startDate:startsAt,description,callId,participants,organizationId,createdBy:req.user.user.id});
  res.json(meeting);
  });


router.get("/get-meetings",authMiddleware, async(req,res)=>{
  // fetch all meeting user is one of the participant
  console.log("get meeting")

  const meetings = await Meeting.find({participants:req.user.user.id});
  console.log(meetings);
  res.json(meetings);
})

router.get("/get-meeting/:id",authMiddleware, async(req,res)=>{
  const meeting = await Meeting.findById(req.params.id);
  res.json(meeting);
});



export default router;

