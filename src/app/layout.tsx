import "./globals.css";
import { NotificationsProvider } from "@/components/Notifications/NotificationsProvider";
import LocaleProvider from "@/components/LocaleProvider";
import { getLocale, getMessages } from "next-intl/server";

export const metadata = {
    title: "Banny - Banner Creator",
    description: "Create stunning banners with ease.",
};

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const locale = await getLocale();
    const messages = await getMessages();
    const messagesDe = (await import("@/messages/de.json")).default;
    const messagesEn = (await import("@/messages/en.json")).default;

    return (
        <html lang={locale}>
            <body>
                <LocaleProvider
                    messages={{ de: messagesDe, en: messagesEn }}
                    initialLocale={locale as "de" | "en"}
                    initialMessages={messages}
                >
                    <NotificationsProvider>{children}</NotificationsProvider>
                </LocaleProvider>
            </body>
        </html>
    );
}
