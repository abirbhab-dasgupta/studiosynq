
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { sendEmail } from "./email";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema,
    }),
    emailAndPassword: {
        enabled: true,

        sendResetPassword: async ({ user, url }, request) => {
            void sendEmail({
                to: user.email,
                subject: "Reset your Studiosynq password",
                html: `
          <p>Hi ${user.name},</p>
          <p>Someone requested a password reset for your Studiosynq account.</p>
          <p><a href="${url}" style="color:#D97706">Reset your password →</a></p>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <p>This link expires in 1 hour.</p>
        `,
            });
        },

        onPasswordReset: async ({ user }) => {
            console.log(`Password reset completed for ${user.email}`);
        },
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
        github: {
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        },
    },
    plugins: [username()],
});