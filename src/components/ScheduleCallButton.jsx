/* src/components/ScheduleCallButton.jsx */
import { useState } from 'react';
import BookingModal from './BookingModal';
import styles from './ScheduleCallButton.module.css';
import scheduleIcon from '../assets/icons/morning-routine.svg';

/**
 * ScheduleCallButton
 * Self-contained — manages its own modal state.
 *
 * Props:
 *   variant   — 'primary' (default) | 'secondary' | 'ghost' | 'iconOnly'
 *   size      — 'sm' | 'md' (default) | 'lg'
 *   label     — button text (default: 'Schedule Intro Call')
 *   fullWidth — stretch to container width (default: false)
 *
 * Usage:
 *   <ScheduleCallButton />                          // primary with text
 *   <ScheduleCallButton variant="iconOnly" />       // just the illustration
 *   <ScheduleCallButton variant="iconOnly" size="lg" />
 *   <ScheduleCallButton variant="secondary" size="sm" label="Book a Call" />
 *   <ScheduleCallButton variant="ghost" size="sm" label="Rebook →" />
 *   <ScheduleCallButton fullWidth />
 */

function ScheduleCallButton({
    variant = 'primary',
    size = 'md',
    label = 'Schedule Intro Call',
    fullWidth = false,
}) {
    const [isOpen, setIsOpen] = useState(false);

    // ── Icon-only mode ────────────────────────────────
    if (variant === 'iconOnly') {
        return (
            <>
                <button
                    className={`${styles.iconOnlyBtn} ${styles[`iconOnly_${size}`]}`}
                    onClick={() => setIsOpen(true)}
                    aria-label="Schedule Intro Call"
                    title="Schedule Intro Call"
                >
                    <img
                        src={scheduleIcon}
                        alt=""
                        className={styles.iconOnlyImg}
                        aria-hidden="true"
                    />
                </button>

                <BookingModal
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                />
            </>
        );
    }

    // ── Standard labeled button ───────────────────────
    const classNames = [
        styles.btn,
        styles[variant],
        styles[size],
        fullWidth ? styles.fullWidth : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <>
            <button
                className={classNames}
                onClick={() => setIsOpen(true)}
                aria-label={label}
            >
                <span>{label}</span>
            </button>

            <BookingModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </>
    );
}

export default ScheduleCallButton;