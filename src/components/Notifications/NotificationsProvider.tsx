"use client";

import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";

type NotificationType = "info" | "success" | "error";

type Notification = {
    id: number;
    type: NotificationType;
    message: string;
};

type NotificationsContextValue = {
    showNotification: (type: NotificationType, message: string) => void;
    showError: (message: string) => void;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export const useNotifications = (): NotificationsContextValue => {
    const ctx = useContext(NotificationsContext);
    if (!ctx) {
        throw new Error("useNotifications must be used within a NotificationsProvider");
    }
    return ctx;
};

type NotificationsProviderProps = {
    children: ReactNode;
};

export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({
    children,
}) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const removeNotification = useCallback((id: number) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    const showNotification = useCallback(
        (type: NotificationType, message: string) => {
            const id = Date.now();

            setNotifications((prev) => [...prev, { id, type, message }]);

            window.setTimeout(() => {
                removeNotification(id);
            }, 5000);
        },
        [removeNotification],
    );

    const showError = useCallback(
        (message: string) => {
            showNotification("error", message);
        },
        [showNotification],
    );

    const value = useMemo(
        () => ({
            showNotification,
            showError,
        }),
        [showNotification, showError],
    );

    return (
        <NotificationsContext.Provider value={value}>
            {children}
            <div className="pointer-events-none fixed inset-x-0 top-4 z-[9999] flex justify-center px-4 sm:justify-end sm:px-6">
                <div className="flex max-w-sm flex-col gap-3">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`pointer-events-auto rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur ${
                                notification.type === "error"
                                    ? "border-red-500/40 bg-red-500/15 text-red-100"
                                    : notification.type === "success"
                                        ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-50"
                                        : "border-sky-400/40 bg-sky-500/15 text-sky-50"
                            }`}
                        >
                            {notification.message}
                        </div>
                    ))}
                </div>
            </div>
        </NotificationsContext.Provider>
    );
};

