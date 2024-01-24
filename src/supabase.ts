import { createClient } from "@supabase/supabase-js";
import { Database } from "./database";

const supabase = createClient<Database>(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    {
        realtime: {
            params: {
                eventsPerSecond: 3,
            },
        },
    },
);

declare global {
    interface Window {
        /** @deprecated debug only */
        _s: typeof supabase;
    }
}
if (import.meta.env.DEV) {
    window._s = supabase;
}
export default supabase;
