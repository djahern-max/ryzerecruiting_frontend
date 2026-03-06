// src/components/BookingModal.jsx
import { useEffect } from 'react';
import BookingCard from './BookingCard';
import styles from './BookingModal.module.css';

// variant: "employer" (default) | "candidate"
function BookingModal({ isOpen, onClose, variant = "employer" }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    const title = variant === "candidate" ? "Schedule a Call" : "Schedule an Intro Call";

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div
                className={styles.drawer}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.drawerHeader}>
                    <h2 className={styles.drawerTitle}>{title}</h2>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                        ✕
                    </button>
                </div>
                <div className={styles.drawerBody}>
                    <BookingCard variant={variant} />
                </div>
            </div>
        </div>
    );
}

export default BookingModal;