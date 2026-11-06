"use client";
import GenericPage from "../../components/GenericPage";
export default function Grievance() {
  return <GenericPage title="Grievance Redressal" description={
    <div>
      <p>We are committed to resolving your concerns promptly and fairly. If you have any grievances, please follow our redressal process:</p>
      <ul style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <li><strong>Step 1:</strong> Contact our Customer Support team at support@pick2mart.com with your order details and concern.</li>
        <li><strong>Step 2:</strong> If your issue remains unresolved within 48 hours, escalate it to our Grievance Officer at grievance@pick2mart.com.</li>
        <li><strong>Step 3:</strong> You will receive a final resolution within 7 working days from the date of escalation.</li>
      </ul>
    </div>
  } />;
}
