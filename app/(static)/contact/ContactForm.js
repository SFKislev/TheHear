'use client';

import { useState } from "react";

export default function ContactForm() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        topic: "",
        message: "",
        website: "",
    });
    const [status, setStatus] = useState({ type: "", text: "" });
    const [submitting, setSubmitting] = useState(false);

    function onChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    async function onSubmit(e) {
        e.preventDefault();
        setStatus({ type: "", text: "" });
        setSubmitting(true);

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();

            if (!res.ok || !data?.ok) {
                setStatus({
                    type: "error",
                    text: data?.error || "Submission failed. Please try again.",
                });
                return;
            }

            setStatus({ type: "success", text: "Thanks. Your message was submitted." });
            setForm({ name: "", email: "", topic: "", message: "", website: "" });
        } catch {
            setStatus({ type: "error", text: "Network error. Please try again." });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-4 font-['Geist'] text-xs">
            <div className="hidden" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input
                    id="website"
                    name="website"
                    value={form.website}
                    onChange={onChange}
                    autoComplete="off"
                    tabIndex={-1}
                />
            </div>

            <div>
                <label className="block text-gray-700 mb-1" htmlFor="name">Name</label>
                <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    maxLength={120}
                    value={form.name}
                    onChange={onChange}
                    className="w-full bg-gray-100 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:shadow-xl"
                />
            </div>

            <div>
                <label className="block text-gray-700 mb-1" htmlFor="email">Email</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    maxLength={200}
                    value={form.email}
                    onChange={onChange}
                    className="w-full bg-gray-100 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:shadow-xl"
                />
            </div>

            <div>
                <label className="block text-gray-700 mb-1" htmlFor="topic">Topic (optional)</label>
                <input
                    id="topic"
                    name="topic"
                    type="text"
                    maxLength={160}
                    value={form.topic}
                    onChange={onChange}
                    className="w-full bg-gray-100 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:shadow-xl"
                />
            </div>

            <div>
                <label className="block text-gray-700 mb-1" htmlFor="message">Message</label>
                <textarea
                    id="message"
                    name="message"
                    required
                    maxLength={6000}
                    rows={8}
                    value={form.message}
                    onChange={onChange}
                    className="w-full bg-gray-100 rounded px-3 py-2 resize-y focus:outline-none focus:ring-1 focus:ring-gray-500 focus:shadow-xl"
                />
            </div>

            <button
                type="submit"
                disabled={submitting}
                className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-black disabled:opacity-60"
            >
                {submitting ? "Sending..." : "Send"}
            </button>

            {status.text && (
                <p className={status.type === "error" ? "text-gray-700 bg-red-100 rounded px-3 py-2" : "text-gray-700 bg-green-100 rounded px-3 py-2"}>
                    {status.text}
                </p>
            )}
        </form>
    );
}

