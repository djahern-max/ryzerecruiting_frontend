/*src/pages/PrivacyPolicy.jsx*/
import React from 'react';
import styles from './LegalPages.module.css';

const PrivacyPolicy = () => {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1>Privacy Policy</h1>
                <p className={styles.lastUpdated}>Last Updated: February 15, 2026</p>

                <section>
                    <h2>1. Introduction</h2>
                    <p>
                        Welcome to RYZE.ai ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our recruiting platform.
                    </p>
                </section>

                <section>
                    <h2>2. Information We Collect</h2>

                    <h3>2.1 Information You Provide</h3>
                    <p>We collect information that you provide directly to us, including:</p>
                    <ul>
                        <li>Account information (name, email address, password)</li>
                        <li>Profile information (resume, work history, skills, education)</li>
                        <li>User type (employer or candidate)</li>
                        <li>Communications with us or other users through the platform</li>
                    </ul>

                    <h3>2.2 Information from Third-Party Services</h3>
                    <p>When you authenticate using Google or LinkedIn, we collect:</p>
                    <ul>
                        <li>Your name and email address</li>
                        <li>Profile picture</li>
                        <li>Unique identifier from the authentication provider</li>
                    </ul>

                    <h3>2.3 Automatically Collected Information</h3>
                    <ul>
                        <li>Device and browser information</li>
                        <li>IP address and location data</li>
                        <li>Usage data and analytics</li>
                        <li>Cookies and similar tracking technologies</li>
                    </ul>

                    <h3>2.4 Phone Number and SMS Communications</h3>
                    <p>
                        When you submit a call request through our platform, we collect your
                        phone number to send you transactional SMS notifications. These messages
                        include booking confirmations, call reminders, and cancellation notices.
                        By providing your phone number and submitting a call request, you consent
                        to receive these transactional SMS messages from RYZE.ai. Message
                        and data rates may apply. You may opt out at any time by replying STOP
                        to any message. For help, reply HELP. We do not share your phone number
                        with third parties for marketing purposes. SMS communications are
                        facilitated through Twilio, Inc., our SMS service provider.
                    </p>
                </section>

                <section>
                    <h2>3. How We Use Your Information</h2>
                    <p>We use your information to:</p>
                    <ul>
                        <li>Provide, maintain, and improve our services</li>
                        <li>Create and manage your account</li>
                        <li>Connect employers with candidates</li>
                        <li>Send you updates, newsletters, and marketing communications (with your consent)</li>
                        <li>Respond to your inquiries and provide customer support</li>
                        <li>Detect, prevent, and address fraud and security issues</li>
                        <li>Comply with legal obligations</li>
                        <li>Analyze usage patterns to improve user experience</li>
                    </ul>
                </section>

                <section>
                    <h2>4. How We Share Your Information</h2>

                    <h3>4.1 With Other Users</h3>
                    <p>
                        When you create a profile as a candidate, certain information (such as your resume and work history) may be visible to employers. When you post a job as an employer, that information is visible to candidates.
                    </p>

                    <h3>4.2 Service Providers</h3>
                    <p>
                        We may share your information with third-party service providers who perform services on our behalf, such as hosting, analytics, email delivery, and customer support.
                    </p>

                    <h3>4.3 Legal Requirements</h3>
                    <p>
                        We may disclose your information if required by law or in response to valid requests by public authorities.
                    </p>

                    <h3>4.4 Business Transfers</h3>
                    <p>
                        If we are involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.
                    </p>
                </section>

                <section>
                    <h2>5. Your Privacy Rights</h2>
                    <p>Depending on your location, you may have the following rights:</p>
                    <ul>
                        <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                        <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                        <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                        <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                        <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                        <li><strong>Withdraw Consent:</strong> Withdraw consent for data processing where applicable</li>
                    </ul>
                    <p>
                        To exercise these rights, please contact us at privacy@ryzerecruiting.com
                    </p>
                </section>

                <section>
                    <h2>6. Data Security</h2>
                    <p>
                        We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
                    </p>
                </section>

                <section>
                    <h2>7. Data Retention</h2>
                    <p>
                        We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law.
                    </p>
                </section>

                <section>
                    <h2>8. Cookies and Tracking Technologies</h2>
                    <p>
                        We use cookies and similar tracking technologies to track activity on our platform and hold certain information. You can instruct your browser to refuse all cookies or indicate when a cookie is being sent.
                    </p>
                </section>

                <section>
                    <h2>9. Third-Party Links</h2>
                    <p>
                        Our platform may contain links to third-party websites. We are not responsible for the privacy practices of these external sites.
                    </p>
                </section>

                <section>
                    <h2>10. Children's Privacy</h2>
                    <p>
                        Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children.
                    </p>
                </section>

                <section>
                    <h2>11. Changes to This Privacy Policy</h2>
                    <p>
                        We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
                    </p>
                </section>

                <section>
                    <h2>12. Contact Us</h2>
                    <p>If you have questions about this Privacy Policy, please contact us:</p>
                    <ul>
                        <li>Email: privacy@ryzerecruiting.com</li>
                        <li>Website: https://ryzerecruiting.com/contact</li>
                    </ul>
                </section>
            </div>
        </div>
    );
};

export default PrivacyPolicy;