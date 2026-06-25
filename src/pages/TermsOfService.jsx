/*src/pages/TermsOfService.jsx*/
import React from 'react';
import styles from './LegalPages.module.css';

const TermsOfService = () => {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1>Terms of Service</h1>
                <p className={styles.lastUpdated}>Last Updated: March 16, 2026</p>

                <section>
                    <h2>1. Agreement to Terms</h2>
                    <p>
                        By accessing or using RYZE.ai ("Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Platform.
                    </p>
                </section>

                <section>
                    <h2>2. Description of Service</h2>
                    <p>
                        RYZE.ai is a recruiting platform that connects employers with job candidates. The Platform allows employers to post job listings and candidates to create profiles and apply for positions.
                    </p>
                </section>

                <section>
                    <h2>3. User Accounts</h2>

                    <h3>3.1 Account Creation</h3>
                    <p>
                        To use certain features of the Platform, you must create an account. You may register as either an employer or a candidate. You agree to:
                    </p>
                    <ul>
                        <li>Provide accurate, current, and complete information</li>
                        <li>Maintain and update your information to keep it accurate</li>
                        <li>Maintain the security of your account credentials</li>
                        <li>Accept responsibility for all activities under your account</li>
                        <li>Notify us immediately of any unauthorized use</li>
                    </ul>

                    <h3>3.2 Account Termination</h3>
                    <p>
                        We reserve the right to suspend or terminate your account at any time for violations of these Terms or for any other reason at our discretion.
                    </p>
                </section>

                <section>
                    <h2>4. User Conduct</h2>
                    <p>You agree not to:</p>
                    <ul>
                        <li>Violate any applicable laws or regulations</li>
                        <li>Post false, misleading, or fraudulent information</li>
                        <li>Harass, abuse, or harm other users</li>
                        <li>Spam or send unsolicited communications</li>
                        <li>Attempt to gain unauthorized access to the Platform</li>
                        <li>Use automated systems or bots without permission</li>
                        <li>Interfere with the proper functioning of the Platform</li>
                        <li>Infringe on intellectual property rights</li>
                        <li>Collect user data without consent</li>
                    </ul>
                </section>

                <section>
                    <h2>5. Content</h2>

                    <h3>5.1 User Content</h3>
                    <p>
                        You retain ownership of content you submit to the Platform (resumes, job postings, messages, etc.). By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display your content for the purpose of operating and improving the Platform.
                    </p>

                    <h3>5.2 Content Standards</h3>
                    <p>
                        All content must comply with our content policies. We reserve the right to remove any content that violates these Terms or is otherwise objectionable.
                    </p>

                    <h3>5.3 Our Content</h3>
                    <p>
                        The Platform and its content (excluding user content) are protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, or distribute our content without permission.
                    </p>
                </section>

                <section>
                    <h2>6. Employer-Specific Terms</h2>
                    <p>If you are using the Platform as an employer, you agree to:</p>
                    <ul>
                        <li>Post only legitimate job opportunities</li>
                        <li>Comply with all applicable employment laws</li>
                        <li>Not discriminate in your hiring practices</li>
                        <li>Respect candidate privacy and data protection rights</li>
                        <li>Not misuse candidate information</li>
                    </ul>
                </section>

                <section>
                    <h2>7. Candidate-Specific Terms</h2>
                    <p>If you are using the Platform as a candidate, you agree to:</p>
                    <ul>
                        <li>Provide truthful and accurate information in your profile</li>
                        <li>Not misrepresent your qualifications or experience</li>
                        <li>Respect employer communications and privacy</li>
                        <li>Understand that we do not guarantee job placement</li>
                    </ul>
                </section>


                <section>
                    <h2>8. SMS Notifications</h2>
                    <p>
                        By providing your phone number and checking the SMS consent box on our booking
                        form, you explicitly consent to receive transactional SMS notifications from
                        RYZE GROUP, Inc. (RYZE.ai). These messages include booking confirmations, call
                        reminders, and cancellation notices. No SMS messages are sent without this
                        explicit opt-in.
                    </p>
                    <ul>
                        <li><strong>Sender:</strong> RYZE GROUP, Inc. d/b/a RYZE.ai</li>
                        <li><strong>Message Frequency:</strong> Message frequency varies based on your booking activity. You will typically receive 2–4 messages per scheduled call (confirmation, reminders, and any cancellation notice).</li>
                        <li><strong>Message &amp; Data Rates:</strong> Message and data rates may apply depending on your mobile carrier and plan.</li>
                        <li><strong>Opt-Out:</strong> <strong>Reply STOP</strong> to any message to unsubscribe. You will receive a one-time confirmation and no further messages will be sent.</li>
                        <li><strong>Help:</strong> <strong>Reply HELP</strong> for assistance or contact us at <a href="mailto:dane@ryze.ai">dane@ryze.ai</a>.</li>
                        <li><strong>No Marketing:</strong> We do not send marketing or promotional SMS messages. All messages are transactional only.</li>
                        <li><strong>Third-Party Provider:</strong> SMS communications are facilitated through Twilio, Inc. Your phone number will not be shared with third parties for marketing purposes.</li>
                    </ul>
                    <p>
                        For more information on how we handle your phone number, see our{' '}
                        <a href="/privacy">Privacy Policy</a>.
                    </p>
                </section>



                <section>
                    <h2>9. Third-Party Services</h2>
                    <p>
                        Our Platform integrates with third-party services (such as Google and LinkedIn for authentication). Your use of these services is subject to their respective terms and privacy policies. We are not responsible for third-party services.
                    </p>
                </section>

                <section>
                    <h2>10. Fees and Payment</h2>
                    <p>
                        Some features of the Platform may require payment. All fees are non-refundable unless otherwise stated. We reserve the right to change our pricing at any time.
                    </p>
                </section>

                <section>
                    <h2>11. Disclaimers</h2>
                    <p>
                        THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT GUARANTEE:
                    </p>
                    <ul>
                        <li>The accuracy, completeness, or usefulness of any information on the Platform</li>
                        <li>That the Platform will be uninterrupted or error-free</li>
                        <li>That defects will be corrected</li>
                        <li>That the Platform is free from viruses or harmful components</li>
                        <li>Job placement or hiring outcomes</li>
                    </ul>
                </section>

                <section>
                    <h2>12. Limitation of Liability</h2>
                    <p>
                        TO THE MAXIMUM EXTENT PERMITTED BY LAW, RYZE.ai SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
                    </p>
                </section>

                <section>
                    <h2>13. Indemnification</h2>
                    <p>
                        You agree to indemnify and hold harmless RYZE.ai from any claims, damages, losses, liabilities, and expenses arising from your use of the Platform or violation of these Terms.
                    </p>
                </section>

                <section>
                    <h2>14. Dispute Resolution</h2>
                    <p>
                        Any disputes arising from these Terms or your use of the Platform shall be resolved through binding arbitration, except where prohibited by law.
                    </p>
                </section>

                <section>
                    <h2>15. Governing Law</h2>
                    <p>
                        These Terms are governed by the laws of the United States, without regard to conflict of law principles.
                    </p>
                </section>

                <section>
                    <h2>16. Changes to Terms</h2>
                    <p>
                        We reserve the right to modify these Terms at any time. We will notify users of material changes. Your continued use of the Platform after changes constitutes acceptance of the new Terms.
                    </p>
                </section>

                <section>
                    <h2>17. Severability</h2>
                    <p>
                        If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full effect.
                    </p>
                </section>

                <section>
                    <h2>18. Contact Information</h2>
                    <p>If you have questions about these Terms, please contact us:</p>
                    <ul>
                        <li>Email: <a href="mailto:dane@ryze.ai">dane@ryze.ai</a></li>
                        <li>Website: <a href="https://ryze.ai">https://ryze.ai</a></li>
                    </ul>
                </section>
            </div>
        </div>
    );
};

export default TermsOfService;