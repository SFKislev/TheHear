import { initializeApp, getApp, getApps } from "firebase/app";
import { addDoc, collection, getFirestore, serverTimestamp } from "firebase/firestore";
import { firebaseConfig } from "@/utils/database/firebaseConfig";
import nodemailer from "nodemailer";

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request) {
    try {
        const body = await request.json();
        const name = (body?.name || "").trim();
        const email = (body?.email || "").trim().toLowerCase();
        const topic = (body?.topic || "").trim();
        const message = (body?.message || "").trim();
        const website = (body?.website || "").trim(); // Honeypot

        if (website) {
            return Response.json({ ok: true });
        }

        if (!name || !email || !message) {
            return Response.json(
                { ok: false, error: "Missing required fields." },
                { status: 400 }
            );
        }

        if (!isValidEmail(email)) {
            return Response.json(
                { ok: false, error: "Invalid email address." },
                { status: 400 }
            );
        }

        if (name.length > 120 || topic.length > 160 || message.length > 6000) {
            return Response.json(
                { ok: false, error: "Input too long." },
                { status: 400 }
            );
        }

        const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
        const smtpPort = Number(process.env.SMTP_PORT || "465");
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;
        const contactTo = process.env.CONTACT_TO || smtpUser;
        const contactFrom = process.env.CONTACT_FROM || smtpUser;

        if (!smtpUser || !smtpPass || !contactTo || !contactFrom) {
            return Response.json(
                { ok: false, error: "Contact service is not configured yet." },
                { status: 500 }
            );
        }

        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        });

        const subjectTopic = topic ? ` - ${topic}` : "";
        const subject = `[The Hear Contact] ${name}${subjectTopic}`;
        const text = [
            `Name: ${name}`,
            `Email: ${email}`,
            `Topic: ${topic || "n/a"}`,
            "",
            message,
        ].join("\n");

        await transporter.sendMail({
            from: contactFrom,
            to: contactTo,
            replyTo: email,
            subject,
            text,
        });

        const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
        const db = getFirestore(app);
        await addDoc(collection(db, "- metadata -", "contact", "submissions"), {
            name,
            email,
            topic: topic || null,
            message,
            createdAt: serverTimestamp(),
            source: "contact-page",
            emailDelivered: true,
        });

        return Response.json({ ok: true });
    } catch (error) {
        console.error("[CONTACT] Submission failed:", error);
        return Response.json(
            { ok: false, error: "Submission failed. Please try again later." },
            { status: 500 }
        );
    }
}
