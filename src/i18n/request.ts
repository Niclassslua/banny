import { getRequestConfig } from "next-intl/server";

/** Default locale for static export (GitHub Pages). Client-side switch via LocaleProvider. */
const DEFAULT_LOCALE = "de";

export default getRequestConfig(async () => {
    return {
        locale: DEFAULT_LOCALE,
        messages: (await import(`../messages/${DEFAULT_LOCALE}.json`)).default,
    };
});

