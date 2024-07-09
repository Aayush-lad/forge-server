import nodemailer from "nodemailer";
import { htmlToText } from "nodemailer-html-to-text";
import dotenv from 'dotenv'

dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

transporter.use('compile', htmlToText());

const sendInvitationEmail = async (email, organizationName, password = null) => {

  


  try {
    // Construct the HTML content
    const htmlContent = `
      <p>Hello,</p>
      <p>You have been invited to join ${organizationName} organization.</p>
      <p>Click <a href="${process.env.CLIENT_URL}/auth">here</a> to accept the invitation.</p>
      ${password ? `<p>Your temporary credentials:</p><p>Email: ${email}</p><p>Password: ${password}</p>` : ''}
      <p>Best regards,</p>
      <p>Forge Team</p>
    `;

    // Construct the plain text content
    const textContent = `
      Hello,

      You have been invited to join ${organizationName} organization.

      Click here to accept the invitation: ${process.env.CLIENT_URL}/auth

      ${password ? `Your temporary credentials:\nEmail: ${email}\nPassword: ${password}\n` : ''}

      Best regards,

      Forge Team
    `;

 
    await transporter.sendMail({
      from: 'forge@gmail.com', 
      to: email, 
      subject: `Invitation to join ${organizationName}`, 
      html: htmlContent, 
      text: textContent 
    });

   
  } catch (error) {
    console.error('Error sending invitation email:', error);
    throw new Error('Failed to send invitation email');
  }
};

// send reset password mail



const sendResetPasswordEmail = async (email, resetLink) => {




  try {
    
    const htmlContent = `
      <p>Hello,</p>
      <p>A password reset request has been initiated for your account.</p>
      <p>Click <a href="${resetLink}">here</a> to reset your password.</p>
      <p>If you did not initiate this request, please ignore this email.</p>
      <p>Best regards,</p>
      <p>Forge Team</p>
    `;

    // Construct the plain text content
    const textContent = `
      Hello,

      A password reset request has been initiated for your account.

      Click here to reset your password: ${resetLink}

      If you did not initiate this request, please ignore this email.

      Best regards,

      Forge Team
    `;

    await transporter.sendMail({
      from: 'forge@gmail.com', 
      to: email, // list of receivers
      subject: 'Password Reset Request', 
      html: htmlContent, 
      text: textContent 
    });


  } catch (error) {
    console.error('Error sending reset password email:', error);
    throw new Error('Failed to send reset password email');
  }
};

export default {
  sendInvitationEmail,
  sendResetPasswordEmail,
};
