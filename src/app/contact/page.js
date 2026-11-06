"use client";
import GenericPage from "../../components/GenericPage";
export default function Contact() {
  return <GenericPage title="Contact Us" description={
    <div>
      <p>Our dedicated customer support team is available 24/7 to assist you.</p>
      <div style={{ marginTop: "30px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
        <div style={{ padding: "20px", border: "1px solid #e2e8f0", borderRadius: "12px" }}>
          <h3 style={{ marginBottom: "8px", color: "#0f172a" }}>Call Us</h3>
          <p>1800-123-4567<br/><small style={{ color: "#64748b" }}>(Toll Free in India)</small></p>
        </div>
        <div style={{ padding: "20px", border: "1px solid #e2e8f0", borderRadius: "12px" }}>
          <h3 style={{ marginBottom: "8px", color: "#0f172a" }}>Email Us</h3>
          <p>support@pick2mart.com</p>
        </div>
        <div style={{ padding: "20px", border: "1px solid #e2e8f0", borderRadius: "12px" }}>
          <h3 style={{ marginBottom: "8px", color: "#0f172a" }}>Live Chat</h3>
          <p>Available on our app and website</p>
        </div>
      </div>
    </div>
  } />;
}
