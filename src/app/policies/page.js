"use client";
import GenericPage from "../../components/GenericPage";
export default function Policies() {
  return <GenericPage title="Our Policies" description={
    <div>
      <p>We believe in transparency. Read our core policies below:</p>
      <ul style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <li><strong>Return Policy:</strong> Enjoy hassle-free returns within 7 days.</li>
        <li><strong>Terms of Use:</strong> The rules and guidelines for using our platform.</li>
        <li><strong>Security & Privacy:</strong> How we protect your data.</li>
        <li><strong>Grievance Redressal:</strong> Our mechanism to address your concerns.</li>
        <li><strong>EPR Compliance:</strong> Our commitment to environmental responsibility.</li>
      </ul>
    </div>
  } />;
}
