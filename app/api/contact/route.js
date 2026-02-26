import { initializeApp, getApp, getApps } from "firebase/app";
import { addDoc, collection, getFirestore, serverTimestamp } from "firebase/firestore";
import { firebaseConfig } from "@/utils/database/firebaseConfig";

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

        const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
        const db = getFirestore(app);

        await addDoc(collection(db, "- metadata -", "contact", "submissions"), {
            name,
            email,
            topic: topic || null,
            message,
            createdAt: serverTimestamp(),
            source: "contact-page",
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

