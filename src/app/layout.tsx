import "./globals.css";

import { Providers } from "./providers";

export const metadata = {
    title: "Banny - Banner Creator",
    description: "Create stunning banners with ease.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
