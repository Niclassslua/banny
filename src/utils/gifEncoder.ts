export interface GifFrame {
    imageData: ImageData;
    delayMs: number;
}

interface GifOptions {
    loop?: number;
}

class ByteWriter {
    private chunks: number[] = [];

    writeByte(value: number) {
        this.chunks.push(value & 0xff);
    }

    writeBytes(values: ArrayLike<number>) {
        for (let index = 0; index < values.length; index += 1) {
            this.writeByte(values[index]);
        }
    }

    writeUint16(value: number) {
        this.writeByte(value & 0xff);
        this.writeByte((value >> 8) & 0xff);
    }

    writeASCII(value: string) {
        for (let index = 0; index < value.length; index += 1) {
            this.writeByte(value.charCodeAt(index));
        }
    }

    toUint8Array() {
        return Uint8Array.from(this.chunks);
    }
}

interface QuantizedFrame {
    indices: Uint8Array;
    palette: Uint8Array;
    transparentIndex: number;
    delayCs: number;
    minCodeSize: number;
    colorTableSizePower: number;
}

function quantizeComponent(value: number, steps: number) {
    if (steps <= 1) {
        return 0;
    }

    const step = Math.round((value / 255) * (steps - 1));
    return Math.round((step / (steps - 1)) * 255);
}

function quantizeFrame(frame: GifFrame, levelsPerChannel = 6): QuantizedFrame {
    const { imageData, delayMs } = frame;
    const { data, width, height } = imageData;
    const pixelCount = width * height;
    const indices = new Uint8Array(pixelCount);
    const palette: number[] = [];
    const colorMap = new Map<string, number>();
    let transparentIndex = -1;
    let paletteIndex = 0;

    for (let pixel = 0; pixel < pixelCount; pixel += 1) {
        const offset = pixel * 4;
        const alpha = data[offset + 3];

        if (alpha < 16) {
            if (transparentIndex === -1) {
                transparentIndex = paletteIndex;
                colorMap.set("__transparent__", transparentIndex);
                palette.push(0, 0, 0);
                paletteIndex += 1;
            }

            indices[pixel] = transparentIndex;
            continue;
        }

        const red = quantizeComponent(data[offset], levelsPerChannel);
        const green = quantizeComponent(data[offset + 1], levelsPerChannel);
        const blue = quantizeComponent(data[offset + 2], levelsPerChannel);
        const key = `${red}|${green}|${blue}`;

        let index = colorMap.get(key);

        if (index === undefined) {
            index = paletteIndex;
            paletteIndex += 1;
            colorMap.set(key, index);
            palette.push(red, green, blue);
        }

        indices[pixel] = index;
    }

    if (!palette.length) {
        palette.push(0, 0, 0);
        paletteIndex = 1;
    }

    const paletteCount = Math.max(paletteIndex, 1);
    let colorTableSizePower = 0;

    while ((1 << colorTableSizePower) < Math.max(paletteCount, 2)) {
        colorTableSizePower += 1;
    }

    const targetSize = 1 << colorTableSizePower;

    while (palette.length / 3 < targetSize) {
        palette.push(0, 0, 0);
    }

    const minCodeSize = Math.max(2, colorTableSizePower);
    const delayCs = Math.max(2, Math.round(delayMs / 10));

    return {
        indices,
        palette: Uint8Array.from(palette),
        transparentIndex,
        delayCs,
        minCodeSize,
        colorTableSizePower,
    };
}

function createSubBlocks(data: Uint8Array) {
    const blocks: number[] = [];

    for (let offset = 0; offset < data.length; offset += 255) {
        const length = Math.min(255, data.length - offset);
        blocks.push(length);

        for (let index = 0; index < length; index += 1) {
            blocks.push(data[offset + index]);
        }
    }

    blocks.push(0);

    return Uint8Array.from(blocks);
}

function lzwEncode(indices: Uint8Array, minCodeSize: number) {
    const clearCode = 1 << minCodeSize;
    const endCode = clearCode + 1;
    let codeSize = minCodeSize + 1;
    let dictSize = endCode + 1;
    const maxDictionary = 1 << 12;
    const dictionary = new Map<string, number>();

    for (let i = 0; i < clearCode; i += 1) {
        dictionary.set(i.toString(), i);
    }

    const output: number[] = [];
    let bitBuffer = 0;
    let bitCount = 0;

    const writeCode = (code: number) => {
        bitBuffer |= code << bitCount;
        bitCount += codeSize;

        while (bitCount >= 8) {
            output.push(bitBuffer & 0xff);
            bitBuffer >>= 8;
            bitCount -= 8;
        }
    };

    const resetDictionary = () => {
        dictionary.clear();
        for (let i = 0; i < clearCode; i += 1) {
            dictionary.set(i.toString(), i);
        }
        dictSize = endCode + 1;
        codeSize = minCodeSize + 1;
        writeCode(clearCode);
    };

    writeCode(clearCode);

    let current = indices[0].toString();

    for (let i = 1; i < indices.length; i += 1) {
        const symbol = indices[i];
        const key = `${current},${symbol}`;

        if (dictionary.has(key)) {
            current = key;
        } else {
            const value = dictionary.get(current);
            if (value !== undefined) {
                writeCode(value);
            }

            if (dictSize < maxDictionary) {
                dictionary.set(key, dictSize);
                dictSize += 1;

                if (dictSize === 1 << codeSize && codeSize < 12) {
                    codeSize += 1;
                }
            } else {
                resetDictionary();
            }

            current = symbol.toString();
        }
    }

    const lastValue = dictionary.get(current);
    if (lastValue !== undefined) {
        writeCode(lastValue);
    }

    writeCode(endCode);

    if (bitCount > 0) {
        output.push(bitBuffer & 0xff);
    }

    return Uint8Array.from(output);
}

export function createGifFromFrames(frames: GifFrame[], options: GifOptions = {}) {
    if (!frames.length) {
        throw new Error("Es wurden keine Frames übergeben");
    }

    const [{ imageData: { width, height } }] = frames;
    const writer = new ByteWriter();
    writer.writeASCII("GIF89a");
    writer.writeUint16(width);
    writer.writeUint16(height);
    writer.writeByte(0x70);
    writer.writeByte(0);
    writer.writeByte(0);

    const loopCount = options.loop ?? 0;
    writer.writeByte(0x21);
    writer.writeByte(0xff);
    writer.writeByte(11);
    writer.writeASCII("NETSCAPE2.0");
    writer.writeByte(3);
    writer.writeByte(1);
    writer.writeUint16(loopCount);
    writer.writeByte(0);

    const preparedFrames = frames.map((frame) => quantizeFrame(frame));

    preparedFrames.forEach((frame) => {
        writer.writeByte(0x21);
        writer.writeByte(0xf9);
        writer.writeByte(4);
        const transparencyFlag = frame.transparentIndex >= 0 ? 1 : 0;
        const disposalMethod = 2;
        writer.writeByte((disposalMethod << 2) | transparencyFlag);
        writer.writeUint16(frame.delayCs);
        writer.writeByte(frame.transparentIndex >= 0 ? frame.transparentIndex : 0);
        writer.writeByte(0);

        writer.writeByte(0x2c);
        writer.writeUint16(0);
        writer.writeUint16(0);
        writer.writeUint16(width);
        writer.writeUint16(height);
        const sizeField = Math.max(0, frame.colorTableSizePower - 1);
        writer.writeByte(0x80 | sizeField);
        writer.writeBytes(frame.palette);

        const encoded = lzwEncode(frame.indices, frame.minCodeSize);
        writer.writeByte(frame.minCodeSize);
        writer.writeBytes(createSubBlocks(encoded));
    });

    writer.writeByte(0x3b);

    return writer.toUint8Array();
}
