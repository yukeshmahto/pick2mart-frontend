"use client";
import GenericPage from "../../components/GenericPage";
export default function Returns() {
  return <GenericPage title="Cancellation & Returns" description={
    <div>
      <p>We want you to love your purchase. If you don't, we're here to help.</p>
      <ul style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <li><strong>Cancellation:</strong> You can cancel your order anytime before it has been dispatched from your Account page.</li>
        <li><strong>Returns:</strong> Items can be returned within 7 days of delivery. The item must be unused and in its original packaging.</li>
        <li><strong>Refunds:</strong> Once we receive your return, refunds are processed within 3-5 business days to your original payment method.</li>
      </ul>
      <p style={{ marginTop: "20px" }}>To initiate a return, go to your Orders page and select "Return Item".</p>
    </div>
  } />;
}
