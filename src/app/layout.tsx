import "./globals.css";

export const metadata = {
    title: "Banner Creator",
    description: "Create stunning banners with ease.",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {children}
        </body>
        </html>
    );
}
