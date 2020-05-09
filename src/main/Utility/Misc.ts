export class MiscUtil {
    // Taken from: https://stackoverflow.com/questions/9267899/arraybuffer-to-base64-encoded-string
    static ArrayBufferToBase64String = (buffer: ArrayBuffer): string =>
        btoa([].reduce.call(new Uint8Array(buffer), (p: string, c: number) => p + String.fromCharCode(c), ''));

    static CopyArrayBuffer = (buffer: ArrayBuffer): ArrayBuffer =>
        buffer.slice(0);
}