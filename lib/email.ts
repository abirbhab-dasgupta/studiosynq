import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
    const { error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || "SyncSpace <onboarding@resend.dev>",
        to,
        subject,
        html,
    });

    if (error) {
        console.error("[email] Failed to send:", error);
    }
}