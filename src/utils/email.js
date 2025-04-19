import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({ to, subject, html, from = 'onboarding@resend.dev' }) => {
    try {
        const data = await resend.emails.send({
            from,
            to,
            subject,
            html,
        });

        return {
            success: true,
            data,
            message: 'Email sent successfully'
        };
    } catch (error) {
        console.error('Error sending email:', error);
        return {
            success: false,
            error: error.message,
            message: 'Failed to send email'
        };
    }
};
