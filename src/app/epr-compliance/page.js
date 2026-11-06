"use client";
import GenericPage from "../../components/GenericPage";
export default function EPRCompliance() {
  return <GenericPage title="EPR Compliance" description={
    <div>
      <p>Extended Producer Responsibility (EPR) is our commitment to a sustainable environment.</p>
      <ul style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <li><strong>E-Waste Management:</strong> We actively participate in the safe disposal and recycling of electronic waste.</li>
        <li><strong>Packaging Reduction:</strong> We continuously strive to reduce the use of plastics and non-recyclable materials in our packaging.</li>
        <li><strong>Recycling Partners:</strong> We partner with certified recyclers to ensure our products are disposed of in an eco-friendly manner.</li>
      </ul>
      <p style={{ marginTop: "20px" }}>For details on how to return your e-waste for recycling, please contact ewaste@pick2mart.com.</p>
    </div>
  } />;
}
