"use client";
import GenericPage from "../../components/GenericPage";
export default function Help() {
  return <GenericPage title="Help Center" description={
    <div>
      <p>How can we help you today?</p>
      <ul style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <li><strong>Track Order:</strong> Enter your order ID to get real-time status updates.</li>
        <li><strong>Shipping & Delivery:</strong> Information about delivery timelines and charges.</li>
        <li><strong>Cancellation & Returns:</strong> How to return or cancel an item.</li>
        <li><strong>Contact Us:</strong> Reach our 24/7 customer support team.</li>
      </ul>
    </div>
  } />;
}
