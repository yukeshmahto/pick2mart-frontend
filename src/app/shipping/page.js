"use client";
import GenericPage from "../../components/GenericPage";
export default function Shipping() {
  return <GenericPage title="Shipping & Delivery" description={
    <div>
      <p>Information about our delivery timelines and charges:</p>
      <ul style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <li><strong>Standard Delivery:</strong> 3-5 business days (Free on orders above ₹499)</li>
        <li><strong>Express Delivery:</strong> 1-2 business days (₹99 flat rate)</li>
        <li><strong>Same Day Delivery:</strong> Available in select cities for orders placed before 12 PM (₹149)</li>
      </ul>
      <p style={{ marginTop: "20px" }}>You will receive an email and SMS with a tracking link once your order is dispatched.</p>
    </div>
  } />;
}
