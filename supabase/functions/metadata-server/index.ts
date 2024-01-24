import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.log("Hello from Functions!");

const headers = { "Content-Type": "application/json", ...corsHeaders };

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("{}", { headers });
    }

    if (req.method !== "POST") {
        return new Response(JSON.stringify({ msg: "method not allowed" }), {
            status: 405,
            headers,
        });
    }

    const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { user } = await req.json();
    if (!user) {
        return new Response(JSON.stringify({ msg: "missing user" }), {
            status: 400,
            headers,
        });
    }

    const { data, error } = await supabase.auth.admin.getUserById(user);
    if (error) {
        return new Response(JSON.stringify(error), {
            status: 500,
            headers,
        });
    }
    return new Response(JSON.stringify(data.user?.user_metadata), {
        headers,
    });
});
