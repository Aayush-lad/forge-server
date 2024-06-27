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
        from: 'forage@gmail.com',
        to: email,
        subject: `Invitation to join ${organizationName}`,
        html: `
          <p>Hello,</p>
          <p>You have been invited to join ${organizationName} organization.</p>
          <p>Click <a href="https://yourapp.com/accept-invite">here</a> to accept the invitation.</p>
          <p>Best regards,</p>
          <p>Your App Team</p>
        `,
        text: htmlToText.toString(`
          Hello,
  
          You have been invited to join ${organizationName} organization.
  
          Click here to accept the invitation: http://localhost:3000/accept-invite
  
          Your temporary credentials
  
          Email : ${email}
          Password : ${password}
  
          Best regards,
          
          Forage,
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