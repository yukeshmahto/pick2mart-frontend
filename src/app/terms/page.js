"use client";
import GenericPage from "../../components/GenericPage";
export default function Terms() {
  return <GenericPage title="Terms of Use" description={
    <div>
      <p>Welcome to Pick2Mart. By accessing and using this website, you agree to comply with and be bound by the following terms and conditions:</p>
      <ul style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <li><strong>Account Responsibility:</strong> You are responsible for maintaining the confidentiality of your account credentials.</li>
        <li><strong>Content Ownership:</strong> All content on this site is the property of Pick2Mart and is protected by copyright laws.</li>
        <li><strong>Prohibited Conduct:</strong> You may not use the site for any unlawful purpose or to solicit others to perform or participate in any unlawful acts.</li>
        <li><strong>Modifications:</strong> Pick2Mart reserves the right to update or modify these terms at any time without prior notice.</li>
      </ul>
    </div>
  } />;
}
