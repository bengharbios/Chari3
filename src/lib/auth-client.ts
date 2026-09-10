import { createAuthClient } from "better-auth/react"
import { twoFactorClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    fetchOptions: {
        cache: 'no-store',
        headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
        },
    },
    plugins: [
        twoFactorClient()
    ]
})

export const { signIn, signUp, signOut, useSession } = authClient;
