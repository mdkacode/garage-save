import sgMail from "@sendgrid/mail";

// Set your SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_KEY || "");

// Function to send email
/**
 *
 * @param senderEmail
 * @param subject
 * @param text
 * @param html
 * @returns
 */
const sendEmail = async (
  emailId = "hpca@v6world.com",
  senderEmail: string,
  subject: string,
  text: string,
  html: string
) => {
  const msg = {
    to: senderEmail, // Replace with the recipient's email
    from: emailId, // Replace with your email
    subject: subject,
    text: text,
    html: html,
  };

  try {
    const response = await sgMail.send(msg);

    return response.length > 0 ? response[0] : response;
  } catch (error) {
    return error;
  }
};

export default sendEmail;
