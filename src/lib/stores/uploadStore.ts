import { writable } from "svelte/store";

// Simple counter store that increments on each successful upload.
export const uploadCounter = writable(0);

export function incrementUpload() {
    uploadCounter.update((n) => n + 1);
}
