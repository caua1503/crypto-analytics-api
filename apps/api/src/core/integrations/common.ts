export function getDefaultCacheUntil(): Date {
    return new Date(Date.now() + 60 * 60 * 1000);
}
