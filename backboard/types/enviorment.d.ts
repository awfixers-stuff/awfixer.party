declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: "development" | "production";
            BACKBOARD_CONVEX_URL?: string;
            BACKBOARD_ALLOWED_ORIGINS?: string;
            NEXT_PUBLIC_CONVEX_URL?: string;
        }
    }
}

export type {};
