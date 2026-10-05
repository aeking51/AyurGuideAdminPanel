import QRCode from 'qrcode';
import { Product } from '../types';

/**
 * Derives a clean, permanent public slug from a product name and optional fallback code.
 * Example: "Dashamoolarishtam" -> "dashamoolarishtam"
 * Example: "Anu Thailam" -> "anu-thailam"
 */
export function generateProductSlug(name: string, fallbackCode?: string): string {
  if (!name && fallbackCode) {
    return fallbackCode.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  const clean = (name || '')
    .toLowerCase()
    .trim()
    .normalize('NFD') // Remove accents / diacritics
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ''); // Trim leading/trailing hyphens

  if (clean) return clean;

  if (fallbackCode) {
    return fallbackCode.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  return 'medicine';
}

export const PRODUCTION_DOMAIN = 'https://ayur-guide-admin-panel.vercel.app';

/**
 * Returns the canonical base domain for the universal sharing URL.
 * Uses the live production domain for QR generation, Android App Links,
 * and external sharing so codes remain permanent even when generated in staging.
 */
export function getBaseShareUrl(): string {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    const origin = window.location.origin;
    // When inside local or ephemeral development environments, use the permanent production domain
    // to guarantee printed QR codes and shared links are permanent.
    if (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('.run.app')) {
      return PRODUCTION_DOMAIN;
    }
    return origin;
  }
  return PRODUCTION_DOMAIN;
}

/**
 * Returns the permanent canonical public share URL for a product slug.
 * Example: https://DOMAIN/product/dashamoolarishtam
 */
export function getProductShareUrl(slug: string): string {
  const base = getBaseShareUrl();
  const cleanSlug = encodeURIComponent(slug.trim().toLowerCase());
  return `${base}/product/${cleanSlug}`;
}

/**
 * Ensures a product has stable publicSlug and shareQrLink properties.
 * If they already exist, they are preserved strictly to maintain QR code longevity.
 */
export function ensureProductShareFields(product: Partial<Product>): { publicSlug: string; shareQrLink: string } {
  const publicSlug = product.publicSlug && product.publicSlug.trim()
    ? product.publicSlug.trim()
    : generateProductSlug(product.name || '', product.code || '');

  const shareQrLink = product.shareQrLink && product.shareQrLink.trim()
    ? product.shareQrLink.trim()
    : getProductShareUrl(publicSlug);

  return { publicSlug, shareQrLink };
}

/**
 * Generates a Data URL for a QR code encoding exactly the canonical share URL.
 * Strictly encodes only the share_qr_link URL string.
 */
export async function generateQrDataUrl(shareQrLink: string, size = 320): Promise<string> {
  return QRCode.toDataURL(shareQrLink, {
    width: size,
    margin: 2,
    color: {
      dark: '#081C13', // Deep Ayurvedic forest green
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'H',
  });
}

/**
 * Generates a high-resolution printable branded QR canvas for download.
 * Displays:
 * AYURINDEX
 * Ayurvedic Medicine Index
 * [QR CODE]
 * Medicine Name
 * Code: DM001
 * Scan to view this medicine
 */
export async function generatePrintableQrCard(
  shareQrLink: string,
  productName: string,
  productCode: string
): Promise<string> {
  const canvas = document.createElement('canvas');
  const width = 800;
  const height = 1100;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return generateQrDataUrl(shareQrLink, 600);
  }

  // 1. Background
  ctx.fillStyle = '#081C13'; // Ayurvedic deep forest background
  ctx.fillRect(0, 0, width, height);

  // Decorative border
  ctx.strokeStyle = '#23493C';
  ctx.lineWidth = 6;
  ctx.strokeRect(30, 30, width - 60, height - 60);

  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 40, width - 80, height - 80);

  // 2. Brand Header
  ctx.textAlign = 'center';
  ctx.fillStyle = '#10B981';
  ctx.font = 'bold 38px "Cinzel", serif, Georgia';
  ctx.fillText('AYURINDEX', width / 2, 110);

  ctx.fillStyle = '#A7F3D0';
  ctx.font = '500 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Ayurvedic Medicine Index', width / 2, 145);

  // Subtle separator line
  ctx.strokeStyle = '#23493C';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(120, 175);
  ctx.lineTo(width - 120, 175);
  ctx.stroke();

  // 3. QR Code in White Frame
  const qrDataUrl = await generateQrDataUrl(shareQrLink, 440);
  const qrImg = new Image();
  await new Promise<void>((resolve, reject) => {
    qrImg.onload = () => resolve();
    qrImg.onerror = reject;
    qrImg.src = qrDataUrl;
  });

  const qrBoxSize = 480;
  const qrBoxX = (width - qrBoxSize) / 2;
  const qrBoxY = 210;

  // White rounded card background for QR
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);

  ctx.strokeStyle = '#E5E7EB';
  ctx.lineWidth = 2;
  ctx.strokeRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);

  // Draw QR Image
  ctx.drawImage(qrImg, qrBoxX + 20, qrBoxY + 20, qrBoxSize - 40, qrBoxSize - 40);

  // 4. Product Details
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 36px "Cinzel", serif, Georgia';
  // Truncate medicine name if very long
  const displayName = productName.length > 28 ? productName.substring(0, 26) + '...' : productName;
  ctx.fillText(displayName, width / 2, 750);

  ctx.fillStyle = '#FCD34D';
  ctx.font = '600 22px "Plus Jakarta Sans", monospace';
  ctx.fillText(`Code: ${productCode}`, width / 2, 800);

  // 5. Scan Instructions & URL
  ctx.fillStyle = '#9CA3AF';
  ctx.font = '500 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Scan with smartphone camera to view full medicine details', width / 2, 860);

  ctx.fillStyle = '#34D399';
  ctx.font = '16px "Plus Jakarta Sans", monospace';
  const displayUrl = shareQrLink.length > 55 ? shareQrLink.substring(0, 52) + '...' : shareQrLink;
  ctx.fillText(displayUrl, width / 2, 905);

  // 6. Footer branding note
  ctx.fillStyle = '#065F46';
  ctx.font = '14px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Permanent Canonical Product Share QR • AyurIndex Universal Directory', width / 2, 980);

  return canvas.toDataURL('image/png');
}
