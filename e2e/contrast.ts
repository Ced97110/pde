import type { Page } from "@playwright/test";

// Contrast of white text against the brightest 1% of the pixels behind it.
export const worstWhiteContrast = (page: Page, shot: Buffer) =>
  page.evaluate(async (base64) => {
    const image = new Image();
    image.src = `data:image/png;base64,${base64}`;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext("2d")!;
    context.drawImage(image, 0, 0);
    const { data } = context.getImageData(0, 0, image.width, image.height);
    const channel = (value: number) => {
      const c = value / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    const luminances: number[] = [];
    for (let i = 0; i < data.length; i += 4) {
      luminances.push(0.2126 * channel(data[i]) + 0.7152 * channel(data[i + 1]) + 0.0722 * channel(data[i + 2]));
    }
    luminances.sort((a, b) => a - b);
    return 1.05 / (luminances[Math.floor(luminances.length * 0.99)] + 0.05);
  }, shot.toString("base64"));
