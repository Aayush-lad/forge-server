import nodemailer from "nodemailer";
import { htmlToText } from "nodemailer-html-to-text";

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
  console.log("Sending email.....");

  try {
    // Construct the HTML content
    const htmlContent = `
      <p>Hello,</p>
      <p>You have been invited to join ${organizationName} organization.</p>
      <p>Click <a href="http://localhost:3000/auth">here</a> to accept the invitation.</p>
      ${password ? `<p>Your temporary credentials:</p><p>Email: ${email}</p><p>Password: ${password}</p>` : ''}
      <p>Best regards,</p>
      <p>Forge Team</p>
    `;

    // Construct the plain text content
    const textContent = `
      Hello,

      You have been invited to join ${organizationName} organization.

      Click here to accept the invitation: http://localhost:3000/auth

      ${password ? `Your temporary credentials:\nEmail: ${email}\nPassword: ${password}\n` : ''}

      Best regards,

      Forge Team
    `;

    // Send email with defined transport object
    await transporter.sendMail({
      from: 'forge@gmail.com', // sender address
      to: email, // list of receivers
      subject: `Invitation to join ${organizationName}`, // Subject line
      html: htmlContent, // html body
      text: textContent // plain text body
    });

    console.log(`Invitation email sent to ${email}`);
  } catch (error) {
    console.error('Error sending invitation email:', error);
    throw new Error('Failed to send invitation email');
  }
};

export default {
  sendInvitationEmail,
};
