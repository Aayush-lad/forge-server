import nodemailer from "nodemailer"
import { htmlToText } from "nodemailer-html-to-text";

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', 
    port: 587, 
    secure: false, 
    auth: {
      user: 'aayush16903@gmail.com', // Your email address
      pass: 'soqf cdmg aiiq sfpa', // Your email password or application-specific password
    },
});


const sendInvitationEmail = async (email, organizationName,password) => {
    console.log("Sending email.....");
    try {
      await transporter.sendMail({
        from: 'forge@gmail.com',
        to: email,
        subject: `Invitation to join ${organizationName}`,
        html: `
          <p>Hello,</p>
          <p>You have been invited to join ${organizationName} organization.</p>
          <p>Click <a href="https://localhost:3000/auth">here</a> to accept the invitation.</p>
          ${password? `password : ${password}`:""}
          <p>Best regards,</p>
          <p>Forge Team</p>
        `,
        text: htmlToText.toString(`
          Hello,
  
          You have been invited to join ${organizationName} organization.
  
          Click here to accept the invitation: http://localhost:3000/auth
  
          Your temporary credentials
  
          Email : ${email}
          Password : ${password}
  
          Best regards,
          
          Forge,
          Open Source All in one Project Management Tool
  
        `)
      });
      console.log(`Invitation email sent to ${email}`);
    } catch (error) {
      console.error('Error sending invitation email:', error);
      throw new Error('Failed to send invitation email');
    }
  };
  

  export default {
    sendInvitationEmail
  }