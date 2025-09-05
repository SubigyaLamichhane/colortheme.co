/**
 * Color utilities for accessibility and legibility
 */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): RGB {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return { r, g, b };
}

/**
 * Convert RGB to hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.round(n).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(h: number, s: number, l: number): RGB {
  h /= 360;
  s /= 100;
  l /= 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Calculate relative luminance according to WCAG 2.1
 */
export function getLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const srgb = [r, g, b].map((value) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

/**
 * Calculate contrast ratio between two colors according to WCAG 2.1
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if a color combination meets WCAG accessibility standards
 */
export function meetsContrastStandard(
  foreground: string,
  background: string,
  level: "AA" | "AAA" = "AA",
  size: "normal" | "large" = "normal"
): boolean {
  const ratio = getContrastRatio(foreground, background);

  if (level === "AAA") {
    return size === "large" ? ratio >= 4.5 : ratio >= 7;
  }

  return size === "large" ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Find the best contrasting text color (black or white) for a background
 */
export function getBestTextColor(backgroundColor: string): string {
  const whiteContrast = getContrastRatio("#ffffff", backgroundColor);
  const blackContrast = getContrastRatio("#000000", backgroundColor);

  return whiteContrast > blackContrast ? "#ffffff" : "#000000";
}

/**
 * Generate a contrasting color with a minimum contrast ratio
 */
export function generateContrastingColor(
  backgroundColor: string,
  minContrast: number = 4.5,
  preferredLightness: "light" | "dark" | "auto" = "auto"
): string {
  const bgLuminance = getLuminance(backgroundColor);
  const bgRgb = hexToRgb(backgroundColor);
  const { h, s } = rgbToHsl(bgRgb.r, bgRgb.g, bgRgb.b);

  // Determine if we should go lighter or darker
  let targetLighter = preferredLightness === "light";
  if (preferredLightness === "auto") {
    targetLighter = bgLuminance < 0.5;
  }

  // Binary search for the right lightness
  let minL = 0;
  let maxL = 100;
  let attempts = 0;
  const maxAttempts = 20;

  while (attempts < maxAttempts && maxL - minL > 1) {
    const midL = (minL + maxL) / 2;
    const testRgb = hslToRgb(h, s, midL);
    const testColor = rgbToHex(testRgb.r, testRgb.g, testRgb.b);
    const contrast = getContrastRatio(testColor, backgroundColor);

    if (contrast >= minContrast) {
      if (targetLighter) {
        maxL = midL;
      } else {
        minL = midL;
      }
    } else {
      if (targetLighter) {
        minL = midL;
      } else {
        maxL = midL;
      }
    }
    attempts++;
  }

  const finalL = targetLighter ? maxL : minL;
  const finalRgb = hslToRgb(h, s, finalL);
  const result = rgbToHex(finalRgb.r, finalRgb.g, finalRgb.b);

  // Fallback to simple black/white if we couldn't achieve the contrast
  if (getContrastRatio(result, backgroundColor) < minContrast) {
    return getBestTextColor(backgroundColor);
  }

  return result;
}

/**
 * Mix two colors by a given ratio (0 = first color, 1 = second color)
 */
export function mixColors(
  color1: string,
  color2: string,
  ratio: number
): string {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  const r = Math.round(rgb1.r * (1 - ratio) + rgb2.r * ratio);
  const g = Math.round(rgb1.g * (1 - ratio) + rgb2.g * ratio);
  const b = Math.round(rgb1.b * (1 - ratio) + rgb2.b * ratio);

  return rgbToHex(r, g, b);
}

/**
 * Analyze a palette and return accessibility information
 */
export function analyzePaletteAccessibility(colors: string[]) {
  const analysis = {
    totalColors: colors.length,
    contrastPairs: [] as Array<{
      color1: string;
      color2: string;
      ratio: number;
      meetsAA: boolean;
      meetsAAA: boolean;
    }>,
    recommendedTextColors: {} as Record<string, string>,
    overallScore: 0,
  };

  // Analyze all color pairs
  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      const color1 = colors[i];
      const color2 = colors[j];
      const ratio = getContrastRatio(color1, color2);

      analysis.contrastPairs.push({
        color1,
        color2,
        ratio,
        meetsAA: ratio >= 4.5,
        meetsAAA: ratio >= 7,
      });
    }
  }

  // Generate recommended text colors for each palette color
  colors.forEach((color) => {
    analysis.recommendedTextColors[color] = getBestTextColor(color);
  });

  // Calculate overall accessibility score (0-100)
  const totalPairs = analysis.contrastPairs.length;
  const aaPairs = analysis.contrastPairs.filter((p) => p.meetsAA).length;
  analysis.overallScore =
    totalPairs > 0 ? Math.round((aaPairs / totalPairs) * 100) : 0;

  return analysis;
}

/**
 * Get a readable text color for any background color
 */
export function getReadableTextColor(
  backgroundColor: string,
  style: "high-contrast" | "medium-contrast" | "subtle" = "high-contrast"
): string {
  const bgLuminance = getLuminance(backgroundColor);

  switch (style) {
    case "high-contrast":
      return getBestTextColor(backgroundColor);

    case "medium-contrast":
      // Use a less extreme contrast
      return bgLuminance > 0.5 ? "#1f2937" : "#e5e7eb";

    case "subtle":
      // Even more subtle
      return bgLuminance > 0.5 ? "#4b5563" : "#9ca3af";

    default:
      return getBestTextColor(backgroundColor);
  }
}
