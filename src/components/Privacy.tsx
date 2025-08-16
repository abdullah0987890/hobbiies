// src/pages/PrivacyPolicy.tsx

import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

      <p className="mb-4">
        This privacy policy outlines how we collect, use, and protect your personal information when you use our website.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. Information We Collect</h2>
      <p className="mb-4">
        We collect personal information such as your name, email address, and location when you sign up or use our services.
        We may also collect usage data, device information, and cookies to improve our platform.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. How We Use Your Information</h2>
      <ul className="list-disc list-inside mb-4">
        <li>To provide and maintain our services</li>
        <li>To improve user experience</li>
        <li>To communicate with you regarding your account</li>
        <li>To ensure platform security</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. Sharing Your Information</h2>
      <p className="mb-4">
        We do not sell your personal information. We may share your data with trusted service providers only as needed to operate our platform.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. Your Rights</h2>
      <p className="mb-4">
        You have the right to access, update, or delete your personal information at any time. You can do this by contacting our support team.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">5. Security</h2>
      <p className="mb-4">
        We implement industry-standard security measures to protect your data, but no system is 100% secure.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">6. Changes to This Policy</h2>
      <p className="mb-4">
        We may update this privacy policy at any time. Changes will be posted on this page with an updated effective date.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">7. Contact Us</h2>
      <p>
        If you have any questions or concerns about this privacy policy, please contact us at: <br />
        <a href="mailto:your@email.com" className="text-blue-600 underline">
          your@email.com
        </a>
      </p>
    </div>
  );
};

export default PrivacyPolicy;
