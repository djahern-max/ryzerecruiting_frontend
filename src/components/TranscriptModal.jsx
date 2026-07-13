/* src/components/TranscriptModal.jsx */
import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import styles from "./TranscriptModal.module.css";

export default function TranscriptModal({ bookingId, onClose }) {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const res = await apiFetch(`/api/bookings/${bookingId}/transcript`);
                if (!res.ok) throw new Error("No transcript on record for this call.");
                const json = await res.json();
                if (!cancelled) setData(json);
            } catch (e) {
                if (!cancelled) setError(e.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => { cancelled = true; };
    }, [bookingId]);

    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    // Assign each distinct speaker a stable colour slot, in order of appearance.
    const speakers = [...new Set((data?.turns || []).map((t) => t.speaker).filter(Boolean))];
    const slotFor = (speaker) => speakers.indexOf(speaker) % 4;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <div className={styles.headerMain}>
                        <div className={styles.title}>Call Transcript</div>
                        {data && (
                            <div className={styles.subtitle}>
                                {data.name}
                                {data.company_name ? ` · ${data.company_name}` : ""}
                                {" · "}
                                {data.date}
                                {data.time_slot ? ` at ${data.time_slot}` : ""}
                            </div>
                        )}
                    </div>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                        ×
                    </button>
                </div>

                <div className={styles.body}>
                    {loading && <div className={styles.state}>Loading transcript…</div>}
                    {error && <div className={styles.state}>{error}</div>}

                    {data?.meeting_summary && (
                        <div className={styles.summary}>
                            <div className={styles.summaryLabel}>AI Summary</div>
                            <p className={styles.summaryText}>{data.meeting_summary}</p>
                        </div>
                    )}

                    {data?.turns?.map((turn, i) => (
                        <div key={i} className={styles.turn}>
                            <div
                                className={`${styles.speaker} ${styles[`slot${slotFor(turn.speaker)}`]}`}
                            >
                                {turn.speaker || "—"}
                            </div>
                            <p className={styles.text}>{turn.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}