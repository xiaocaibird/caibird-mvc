/**
 * @Owners cmZhou
 * @Title hessian.js 扩展
 */
declare module 'hessian.js' {
    class DecoderV2 {
        public constructor(heap: Buffer);

        public readString(): string;

        public readInt(): number;

        public read(): unknown;
    }

    class EncoderV2 {
        public constructor();

        public byteBuffer: {
            _bytes: Buffer,
            _offset: number,
        };

        public write(data: unknown): void;
    }
}
