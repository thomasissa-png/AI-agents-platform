declare module "pngjs" {
  export class PNG {
    width: number;
    height: number;
    data: Buffer;
    constructor(opts?: { width: number; height: number });
    static sync: {
      read(buf: Buffer): PNG;
      write(png: PNG): Buffer;
    };
  }
}

declare module "pixelmatch" {
  function pixelmatch(
    img1: Buffer | Uint8Array,
    img2: Buffer | Uint8Array,
    output: Buffer | Uint8Array | null,
    width: number,
    height: number,
    options?: { threshold?: number; includeAA?: boolean; alpha?: number },
  ): number;
  export default pixelmatch;
}
