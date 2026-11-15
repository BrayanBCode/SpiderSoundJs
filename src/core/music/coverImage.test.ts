import { afterAll, beforeAll, expect, test } from "bun:test";
import sharp from "sharp";
import { buildCoverImage, COVER_HEIGHT } from "./coverImage.js";

// Sirve una imagen 16:9 de prueba en local para no depender de internet
let server: ReturnType<typeof Bun.serve>;
beforeAll(async () => {
    const png = await sharp({ create: { width: 320, height: 180, channels: 3, background: "#c33" } }).png().toBuffer();
    server = Bun.serve({ port: 0, fetch: () => new Response(png, { headers: { "content-type": "image/png" } }) });
});
afterAll(() => server.stop());

test("arma una imagen del ancho del embed con la portada chica a la izquierda y el resto transparente", async () => {
    const buf = await buildCoverImage(`http://localhost:${server.port}/cover.png`);
    expect(buf).toBeDefined();

    const img = sharp(buf!);
    const meta = await img.metadata();
    expect(meta.width).toBe(400);
    expect(meta.height).toBe(COVER_HEIGHT);

    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    const alphaAt = (x: number, y: number) => data[(y * info.width + x) * info.channels + 3];
    expect(alphaAt(100, 60)).toBe(255); // portada (16:9 a 135 de alto = 240 de ancho)
    expect(alphaAt(350, 60)).toBe(0);   // a la derecha, transparente
    expect(alphaAt(0, 0)).toBeLessThan(255); // esquina redondeada
});

test("si la imagen no se puede bajar devuelve undefined", async () => {
    expect(await buildCoverImage("http://localhost:1/no-existe.png")).toBeUndefined();
});
