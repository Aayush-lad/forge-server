import jwt from "jsonwebtoken"
import dotenv from "dotenv";

dotenv.config();

export default function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  
  if (!token) {
  return res.status(401).json({ message: 'You are not authorized' });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
  if (err) {
  return res.json({ message: 'You are not authorized' });
  }
  req.user = user;
  next();
  });
}




