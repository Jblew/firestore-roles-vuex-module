export function ow_catch(fn: () => void): boolean | string {
    try {
        fn();
        return true;
    } catch (error) {
        return error + "";
    }
}

export function d<T>(value: T | undefined): T {
    if (typeof value === "undefined") throw new Error("d() value is undefined");
    return value;
}
