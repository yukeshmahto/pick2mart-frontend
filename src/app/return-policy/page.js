"use client";
import GenericPage from "../../components/GenericPage";
export default function ReturnPolicy() {
  return <GenericPage title="Return Policy" description={
    <div>
      <p>At Pick2Mart, we strive to give you the best shopping experience possible. However, if you are not completely satisfied with your purchase, you can return the product under the following conditions:</p>
      <ul style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <li><strong>Eligibility:</strong> Items must be unused, in their original packaging, and with all tags intact.</li>
        <li><strong>Timeframe:</strong> Returns must be initiated within 7 days from the date of delivery.</li>
        <li><strong>Non-returnable Items:</strong> Perishable goods, personal hygiene products, and customized items cannot be returned.</li>
        <li><strong>Refund Process:</strong> Once the returned item is received and inspected, refunds will be processed to the original payment method within 3-5 business days.</li>
      </ul>
    </div>
  } />;
}
