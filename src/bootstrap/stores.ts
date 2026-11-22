import { useAppStore } from "@/stores/appStore";

let bootstrapPromise: Promise<void> | null = null

export function bootstrapApp(): Promise<void> {
    if (!bootstrapPromise) {
        bootstrapPromise = (async () => {
            await bootstrapStores()
        })()
    }
    return bootstrapPromise
}

export async function bootstrapStores() {
    const appStore = useAppStore()

    await appStore.initialize()
}

export function isBootstrapped(): Promise<void> {
    return bootstrapPromise ?? bootstrapApp()
}
