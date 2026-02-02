export function getEnumKeys<T extends Record<string, string | number>>(enumObj: T): string[] {
    return Object.keys(enumObj).filter((key) => Number.isNaN(Number(key)));
}
