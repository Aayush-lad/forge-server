import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();


dotenv.config()

const stripe = new Stripe(process.env.STRIPE_KEY);




const register = async (req, res) => {
  const { username, password, email } = req.body;
  try {
    let user = await User.findOne({ username });

    let emailUnique = await User.findOne({ email });
    if (user || emailUnique) {
      return res.json({ message: "User already exists", status: false });
    }

    user = new User({ email, password, username });
    await user.save();
    const payload = {
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        email: user.email,
      },
    };

    const userInfo = await User.findById(user._id, "-password")
      .populate({
        path: "roles.organizationId",
      })
      .populate({
        path: "projects",
      })
      .populate({
        path: "tasks",
      })
      .populate({
        path: "teams",
      })
      .exec();

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: userInfo, status: true });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error", status: "false" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  try {
    let user = await User.findOne({ email });
    if (!user) {
      console.log(user);
      return res.json({ message: "Invalid credentials", status: false });
    }

    const isMatch = await user.comparePassword(password);
    console.log(isMatch);

    if (isMatch == false) {
      console.log("Inside");
      return res.json({ message: "Invalid credentials", status: false });
    }

    const payload = {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        username: user.username,
      },
    };

    // get complete user info including organizationlist , tasks projects teams

    const userInfo = await User.findById(user._id, "-password")
      .populate({
        path: "roles.organizationId",
      })
      .populate({
        path: "projects",
      })
      .populate({
        path: "tasks",
      })
      .populate({
        path: "teams",
      })
      .exec();

    //get all userinfo

    console.log(userInfo);

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: userInfo, status: true });
      }
    );
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ status: false, message: error.message });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await User.findOne(req.user.email)
      .select("-password")
      .populate({
        path: "roles.organizationId",
      })
      .populate({
        path: "projects",
      })
      .populate({
        path: "tasks",
      })
      .populate({
        path: "teams",
      });

    res.json({ user });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

const createCheckoutSession = async (req, res) => {
  console.log(req.body);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price: req.body.price,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `http://localhost:3000/payment/success?plan=${req.body.name}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: "http://localhost:3000/payment/failure",
  });

  res.json({ id: session.id });
};

const changePlan = async (req, res) => {
  const userId = req.user.user.id;
  console.log(req.body);

  try {
    console.log(userId);
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json("User doesnot exist");
    }
    user.plan = req.body.plan;
    console.log(user);
    await user.save();

    res.json({ message: "Plan changed Successfully" });
  } catch (err) {
    console.log(err);
    res.status(501).json("Server Error");
  }
};

export default {
  register,
  login,
  getUser,
  createCheckoutSession,
  changePlan,
};
