"use client";
import GenericPage from "../../components/GenericPage";
export default function Privacy() {
  return <GenericPage title="Security & Privacy" description={
    <div>
      <p>Your privacy and security are our top priorities. Here is how we protect your information:</p>
      <ul style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <li><strong>Data Encryption:</strong> All transactions are secured using industry-standard SSL encryption.</li>
        <li><strong>Information Collection:</strong> We collect only the information necessary to process your orders and improve your shopping experience.</li>
        <li><strong>Third-Party Sharing:</strong> We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties without your consent.</li>
        <li><strong>Cookie Policy:</strong> We use cookies to remember your preferences and enhance site navigation.</li>
      </ul>
    </div>
  } />;
}
