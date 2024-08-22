import nodemailer from 'nodemailer'


/**
 * Sends an email using Nodemailer.
 * @async
 * @function sendEmailService
 * @param {Object} options - Options for sending the email.
 * @param {string} [options.to=""] - The recipient's email address.
 * @param {string} [options.subject=""] - The subject line of the email.
 * @param {string} [options.text=""] - The plaintext content of the email.
 * @param {string} [options.html=""] - The HTML content of the email.
 * @param {Array} [options.attachments=[]] - An array of attachments to include in the email.
 * @returns {Promise<Object>} A promise that resolves to an object containing the result of the email sending process.
*/
const sendEmailService = async({
    to = "",
    subject = "",
    text = "",
    html = "",
    attachments = []
    }={})=>{
    
    const transporter = nodemailer.createTransport({
        host: "localhost",
        service: 'gmail',
        port: 465,
        secure: true,
        auth:{
            user: 'mohamed.raafat.abdelkader@gmail.com',
            pass: 'ekdixqfkfbmyrdit'
        }
    })

    const info = await transporter.sendMail({
        from: 'No-Reply <mohamed.raafat.abdelkader@gmail.com>',
        to,
        subject,
        text,
        html,
        attachments
    })

    return info
}

export default sendEmailService
