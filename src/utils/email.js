import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'anusha.bsit607@iiu.edu.pk',
        pass: process.env.EMAIL_PASS,
    },
});

export const sendEmail = async ({ to, subject, html, from = 'anusha.bsit607@iiu.edu.pk' }) => {

    const mailOptions = {
        from,
        to,
        subject,
        html,
    };

    try {
        await transporter.sendMail(mailOptions);

        return {
            success: true,
            message: 'Email sent successfully'
        };
    } catch (error) {
        console.error('Error sending email:', error);
        return {
            success: false,
            error: error,
            message: 'Failed to send email'
        };
    }
};