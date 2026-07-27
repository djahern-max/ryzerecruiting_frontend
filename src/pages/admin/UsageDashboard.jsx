/* src/pages/admin/UsageDashboard.jsx */
import { useEffect, useState } from "react";
import AdminHeader from "../../components/AdminHeader";
import { apiFetch } from "../../services/api";
import styles from "./UsageDashboard.module.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

function formatCost(value) {
    return `$${Number(value ?? 0).toFixed(4)}`;
}

function barClass(percent) {
    if (percent >= 100) return styles.barRed;
    if (percent >= 80) return styles.barAmber;
    return styles.barNormal;
}

export default function UsageDashboard() {
    const [tenants, setTenants] = useState([]);
    const [total, setTotal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await apiFetch(`${API_BASE}/api/billing/usage`);
                if (!res.ok) throw new Error("Failed to load usage");
                const data = await res.json();
                if (cancelled) return;
                setTenants(data.tenants || []);
                setTotal(data.total ?? null);
            } catch {
                if (!cancelled) setError(true);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    return (
        <div className={styles.page}>
            <AdminHeader active="usage" />
            <main className={styles.main}>
                <div className={styles.pageTop}>
                    <div>
                        <h1 className={styles.pageTitle}>AI Usage</h1>
                        <p className={styles.pageSub}>Per-tenant AI cost for the current month.</p>
                    </div>
                </div>

                {loading ? (
                    <div className={styles.emptyState}>
                        <i className="fi fi-rr-time" style={{ marginRight: "8px" }}></i>
                        Loading usage…
                    </div>
                ) : error ? (
                    <div className={styles.emptyState}>Usage data isn't available right now.</div>
                ) : tenants.length === 0 ? (
                    <div className={styles.emptyState}>No usage recorded this month.</div>
                ) : (
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Tenant</th>
                                    <th>Cost</th>
                                    <th>Budget</th>
                                    <th>Usage</th>
                                    <th>Events</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tenants.map((t) => (
                                    <tr key={t.slug} className={styles.row}>
                                        <td className={styles.nameCell}>{t.slug}</td>
                                        <td>{formatCost(t.cost_usd)}</td>
                                        <td>{formatCost(t.budget)}</td>
                                        <td>
                                            <div className={styles.percentCell}>
                                                <div className={styles.barTrack}>
                                                    <div
                                                        className={`${styles.barFill} ${barClass(t.percent)}`}
                                                        style={{ width: `${Math.min(t.percent, 100)}%` }}
                                                    />
                                                </div>
                                                <span className={styles.percentLabel}>{Math.round(t.percent)}%</span>
                                            </div>
                                        </td>
                                        <td>{t.event_count}</td>
                                    </tr>
                                ))}
                            </tbody>
                            {total != null && (
                                <tfoot>
                                    <tr className={styles.totalRow}>
                                        <td>Total</td>
                                        <td>{formatCost(total)}</td>
                                        <td colSpan={3}></td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}
