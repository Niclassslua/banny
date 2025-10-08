import "./globals.css";

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
        {children}
        </body>
        </html>
    );
}
