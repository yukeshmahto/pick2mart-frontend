import "./globals.css";
import { Providers } from "../context/Providers";

export const metadata = {
  title: "Pick 2 Mart",
  description: "Everything you need. All in one mart.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
