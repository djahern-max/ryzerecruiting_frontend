/* src/components/BookingModal.jsx */
import { useEffect } from 'react';
import BookingCard from './BookingCard';
import styles from './BookingModal.module.css';

function BookingModal({ isOpen, onClose }) {
    // Lock body scroll while open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div
                className={styles.drawer}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.drawerHeader}>
                    <h2 className={styles.drawerTitle}>Schedule an Intro Call</h2>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                        ✕
                    </button>
                </div>
                <div className={styles.drawerBody}>
                    <BookingCard />
                </div>
            </div>
        </div>
    );
}

export default BookingModal;