import { StandTemplate } from '../components/dashboard/ReviewLinkTab';
import { BusinessSettings } from '../types';
import { GOOGLE_QR_CENTER_LOGO, GOOGLE_QR_REMOTE_URL } from '../constants/qrLogo';

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number
) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();
}

async function loadImg(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    if (!src.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * Standardized High-Res Circular Logo Drawer:
 * Guarantees every canvas export has an authentic circular logo or initial avatar badge.
 */
function drawCircularLogo(
  ctx: CanvasRenderingContext2D,
  logo: HTMLImageElement | null,
  bizName: string,
  cx: number,
  cy: number,
  size = 140,
  borderColor = '#dadce0',
  bgColor = '#ffffff',
  textColor = '#1a73e8'
) {
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 4;
  ctx.stroke();

  if (logo) {
    ctx.save();
    // Preserve aspect ratio so rectangular logos don't get squished or cropped
    const pad = 12;
    const maxDim = size - pad * 2;
    let drawW = maxDim;
    let drawH = maxDim;
    if (logo.naturalWidth && logo.naturalHeight) {
      const aspect = logo.naturalWidth / logo.naturalHeight;
      if (aspect > 1) {
        drawW = maxDim;
        drawH = maxDim / aspect;
      } else {
        drawH = maxDim;
        drawW = maxDim * aspect;
      }
    }
    ctx.drawImage(logo, cx - drawW / 2, cy - drawH / 2, drawW, drawH);
    ctx.restore();
  } else {
    const initial = bizName ? bizName.trim().charAt(0).toUpperCase() : 'G';
    ctx.fillStyle = textColor;
    ctx.font = `bold ${Math.round(size * 0.45)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initial, cx, cy);
  }
  ctx.restore();
}

/**
 * Standardized 5-Star Rating Pill Drawer:
 * Guarantees every canvas export has 5 stars + 5.0 Rating badge.
 */
function drawRatingPill(
  ctx: CanvasRenderingContext2D,
  cx: number,
  y: number,
  pillW = 420,
  pillH = 70,
  starColor = '#fbbc04',
  textColor = '#b06000',
  bgColor = '#fef7e0',
  borderColor = '#feefc3',
  label = '5.0 Rating'
) {
  ctx.save();
  const x = cx - pillW / 2;
  ctx.fillStyle = bgColor;
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(x, y, pillW, pillH, pillH / 2);
  ctx.fill();
  ctx.stroke();

  const starSize = 36;
  const starGap = 10;
  let starX = x + 26;
  ctx.fillStyle = starColor;
  for (let i = 0; i < 5; i++) {
    drawStar(ctx, starX + starSize / 2, y + pillH / 2, 5, starSize / 2, starSize / 4);
    starX += starSize + starGap;
  }

  ctx.fillStyle = textColor;
  ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, starX + 10, y + pillH / 2);
  ctx.restore();
}

/**
 * Draws the high-res QR code and explicitly stamps the Google center logo with protective rounded shield
 */
async function drawQrWithCenterLogo(
  ctx: CanvasRenderingContext2D,
  qrDataUrl: string,
  qrX: number,
  qrY: number,
  qrSize: number
) {
  const qrImg = await loadImg(qrDataUrl);
  if (qrImg) {
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
  }

  // Stamp Center Logo with Protective White Badge
  let centerLogoImg = await loadImg(GOOGLE_QR_REMOTE_URL);
  if (!centerLogoImg) {
    centerLogoImg = await loadImg(GOOGLE_QR_CENTER_LOGO);
  }

  if (centerLogoImg) {
    const cx = qrX + qrSize / 2;
    const cy = qrY + qrSize / 2;
    const badgeSize = Math.round(qrSize * 0.22);
    const radius = Math.round(badgeSize * 0.20);
    const padding = Math.round(badgeSize * 0.04);
    const logoDrawSize = badgeSize - padding * 2;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(cx - badgeSize / 2, cy - badgeSize / 2, badgeSize, badgeSize, radius);
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#dadce0';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();

    ctx.drawImage(centerLogoImg, cx - logoDrawSize / 2, cy - logoDrawSize / 2, logoDrawSize, logoDrawSize);
  }
}

/**
 * Draws the authentic multi-colored Google wordmark
 */
function drawGoogleWordmark(
  ctx: CanvasRenderingContext2D,
  startX: number,
  y: number,
  fontSize: number
): number {
  ctx.save();
  ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  const letters = [
    { char: 'G', color: '#4285F4' },
    { char: 'o', color: '#EA4335' },
    { char: 'o', color: '#FBBC05' },
    { char: 'g', color: '#4285F4' },
    { char: 'l', color: '#34A853' },
    { char: 'e', color: '#EA4335' },
  ];
  let curX = startX;
  for (const item of letters) {
    ctx.fillStyle = item.color;
    ctx.fillText(item.char, curX, y);
    curX += ctx.measureText(item.char).width;
  }
  ctx.restore();
  return curX;
}

/**
 * Helper to draw verified checkmark badge beside business name
 */
function drawVerifiedBadge(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius = 16,
  bgColor = '#1a73e8'
) {
  ctx.save();
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - radius * 0.45, cy);
  ctx.lineTo(cx - radius * 0.1, cy + radius * 0.35);
  ctx.lineTo(cx + radius * 0.45, cy - radius * 0.35);
  ctx.stroke();
  ctx.restore();
}

/**
 * Standardized High-Resolution (1200 x 1800 px) Canvas Generator for All 16 Commercial Stand Layouts
 */
export async function renderStandToCanvas(
  canvas: HTMLCanvasElement,
  template: StandTemplate,
  settings: BusinessSettings,
  qrDataUrl: string
): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  const width = 1200;
  const height = 1800;
  canvas.width = width;
  canvas.height = height;

  const bizName = settings.businessName || 'Your Business';
  const logo = settings.businessLogo ? await loadImg(settings.businessLogo) : null;

  // -------------------------------------------------------------
  // 1. OFFICIAL GOOGLE CANOPY & CARD
  // -------------------------------------------------------------
  if (template.layoutType === 'official-google') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#dadce0';
    ctx.lineWidth = 10;
    ctx.strokeRect(36, 36, width - 72, height - 72);

    // Google 4-Color Top Stripe
    const segW = (width - 72) / 4;
    ctx.fillStyle = '#4285f4'; ctx.fillRect(36, 36, segW, 26);
    ctx.fillStyle = '#ea4335'; ctx.fillRect(36 + segW, 36, segW, 26);
    ctx.fillStyle = '#fbbc05'; ctx.fillRect(36 + segW * 2, 36, segW, 26);
    ctx.fillStyle = '#34a853'; ctx.fillRect(36 + segW * 3, 36, segW, 26);

    let y = 145;

    // "Review us on Google" Top Header Pill Badge
    const headerPillW = 680;
    const headerPillH = 76;
    const headerPillX = (width - headerPillW) / 2;
    ctx.fillStyle = '#f8f9fa';
    ctx.beginPath();
    ctx.roundRect(headerPillX, y, headerPillW, headerPillH, 38);
    ctx.fill();
    ctx.strokeStyle = '#dadce0';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const prefix = 'Review us on ';
    const prefixW = ctx.measureText(prefix).width;
    const googleW = ctx.measureText('Google').width;
    const totalW = prefixW + googleW;
    const startX = width / 2 - totalW / 2;

    ctx.fillStyle = '#202124';
    ctx.textAlign = 'left';
    ctx.fillText(prefix, startX, y + 50);
    drawGoogleWordmark(ctx, startX + prefixW, y + 50, 36);

    y += 155;

    // Circular Logo Avatar
    drawCircularLogo(ctx, logo, bizName, width / 2, y, 140, '#dadce0', '#ffffff', '#1a73e8');
    y += 105;

    // Business Name + Blue Verified Badge
    ctx.fillStyle = '#202124';
    ctx.font = 'bold 54px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(bizName, width / 2, y);

    drawVerifiedBadge(ctx, width / 2 + ctx.measureText(bizName).width / 2 + 28, y - 18, 16, '#1a73e8');

    y += 42;
    ctx.fillStyle = '#5f6368';
    ctx.font = '500 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Verified on Google Maps', width / 2, y);

    y += 45;

    // 5-Star Rating Pill (Google Yellow / Gold)
    drawRatingPill(ctx, width / 2, y, 430, 72, '#fbbc04', '#b06000', '#fef7e0', '#feefc3', '5.0 Rating');

    y += 115;

    // Invitation text
    ctx.fillStyle = '#202124';
    ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Loved your experience with us?', width / 2, y);
    y += 40;
    ctx.fillStyle = '#5f6368';
    ctx.font = '500 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Leave us a quick 5-star review on Google!', width / 2, y);

    y += 55;

    // QR Box Container with Google Blue Corner Focus Brackets
    const qrBoxSize = 640;
    const qrX = (width - qrBoxSize) / 2;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#dadce0';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(qrX - 20, y - 20, qrBoxSize + 40, qrBoxSize + 40, 24);
    ctx.fill();
    ctx.stroke();

    // Google Blue Corner Focus Accents
    const bracketSize = 30;
    ctx.strokeStyle = '#1a73e8';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(qrX - 10, y + bracketSize - 10);
    ctx.lineTo(qrX - 10, y - 10);
    ctx.lineTo(qrX + bracketSize - 10, y - 10);
    ctx.moveTo(qrX + qrBoxSize + 10 - bracketSize, y - 10);
    ctx.lineTo(qrX + qrBoxSize + 10, y - 10);
    ctx.lineTo(qrX + qrBoxSize + 10, y + bracketSize - 10);
    ctx.moveTo(qrX - 10, y + qrBoxSize + 10 - bracketSize);
    ctx.lineTo(qrX - 10, y + qrBoxSize + 10);
    ctx.lineTo(qrX + bracketSize - 10, y + qrBoxSize + 10);
    ctx.moveTo(qrX + qrBoxSize + 10 - bracketSize, y + qrBoxSize + 10);
    ctx.lineTo(qrX + qrBoxSize + 10, y + qrBoxSize + 10);
    ctx.lineTo(qrX + qrBoxSize + 10, y + qrBoxSize + 10 - bracketSize);
    ctx.stroke();

    await drawQrWithCenterLogo(ctx, qrDataUrl, qrX, y, qrBoxSize);

    y += qrBoxSize + 60;

    // Bottom Scan CTA Pill
    const ctaPillW = 540;
    const ctaPillH = 64;
    ctx.fillStyle = '#f1f3f4';
    ctx.beginPath();
    ctx.roundRect((width - ctaPillW) / 2, y, ctaPillW, ctaPillH, 32);
    ctx.fill();

    ctx.fillStyle = '#3c4043';
    ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('📱  Point phone camera to review', width / 2, y + 42);

    y += 65;
    ctx.fillStyle = '#5f6368';
    ctx.font = '500 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Quick AI review drafts in 10 seconds • Direct Google Maps', width / 2, y);

    // Google 4-Color Bottom Stripe
    ctx.fillStyle = '#4285f4'; ctx.fillRect(36, height - 36 - 20, segW, 20);
    ctx.fillStyle = '#ea4335'; ctx.fillRect(36 + segW, height - 36 - 20, segW, 20);
    ctx.fillStyle = '#fbbc05'; ctx.fillRect(36 + segW * 2, height - 36 - 20, segW, 20);
    ctx.fillStyle = '#34a853'; ctx.fillRect(36 + segW * 3, height - 36 - 20, segW, 20);

    return;
  }

  // -------------------------------------------------------------
  // 2. MODERN SPLIT-HERO PODIUM
  // -------------------------------------------------------------
  if (template.layoutType === 'split-hero') {
    const splitY = 740;
    ctx.fillStyle = '#0b1120';
    ctx.fillRect(0, 0, width, splitY);

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, splitY, width, height - splitY);

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 8;
    ctx.strokeRect(36, 36, width - 72, height - 72);

    let y = 130;
    const pillW = 520;
    ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect((width - pillW) / 2, y, pillW, 60, 30);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#22d3ee';
    ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ AI POWERED REVIEW PORTAL', width / 2, y + 40);

    y += 145;
    drawCircularLogo(ctx, logo, bizName, width / 2, y, 140, '#06b6d4', '#0f172a', '#22d3ee');

    y += 105;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 56px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(bizName, width / 2, y);
    drawVerifiedBadge(ctx, width / 2 + ctx.measureText(bizName).width / 2 + 28, y - 18, 16, '#06b6d4');

    y += 42;
    drawRatingPill(ctx, width / 2, y, 420, 70, '#38bdf8', '#38bdf8', 'rgba(15, 23, 42, 0.9)', '#06b6d4', '5.0 Rating');

    // Pedestal QR
    const qrBoxSize = 650;
    const qrX = (width - qrBoxSize) / 2;
    const qrPedestalY = splitY - 100;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 15;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(qrX - 25, qrPedestalY - 25, qrBoxSize + 50, qrBoxSize + 50, 36);
    ctx.fill();
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.restore();

    await drawQrWithCenterLogo(ctx, qrDataUrl, qrX, qrPedestalY, qrBoxSize);

    y = qrPedestalY + qrBoxSize + 85;
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 44px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Point Camera to Review Us', width / 2, y);
    y += 50;

    ctx.fillStyle = '#64748b';
    ctx.font = '30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Instant AI Review Assistance • Verified Google Maps', width / 2, y);
    return;
  }

  // -------------------------------------------------------------
  // 3. LUXURY GOLD CREST & ORNATE FRAME
  // -------------------------------------------------------------
  if (template.layoutType === 'luxury-crest') {
    ctx.fillStyle = '#0a1128';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 14;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 4;
    ctx.strokeRect(60, 60, width - 120, height - 120);

    let y = 145;
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 28px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚜  EXCELLENCE & REPUTATION  ⚜', width / 2, y);

    y += 135;
    drawCircularLogo(ctx, logo, bizName, width / 2, y, 140, '#d97706', '#ffffff', '#b45309');

    y += 105;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 56px Georgia, serif';
    ctx.fillText(bizName, width / 2, y);
    drawVerifiedBadge(ctx, width / 2 + ctx.measureText(bizName).width / 2 + 28, y - 18, 16, '#f59e0b');

    y += 42;
    ctx.fillStyle = '#fbbf24';
    ctx.font = '24px Georgia, serif';
    ctx.fillText('Prestigious Google Rated Destination', width / 2, y);

    y += 45;
    drawRatingPill(ctx, width / 2, y, 420, 70, '#f59e0b', '#fde68a', '#1e293b', '#d97706', '5.0 Rating');

    y += 125;
    const qrSize = 640;
    const qx = (width - qrSize) / 2;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.roundRect(qx - 20, y - 20, qrSize + 40, qrSize + 40, 28);
    ctx.fill();
    ctx.stroke();

    await drawQrWithCenterLogo(ctx, qrDataUrl, qx, y, qrSize);
    y += qrSize + 85;

    ctx.fillStyle = '#fde68a';
    ctx.font = 'italic bold 38px Georgia, serif';
    ctx.fillText('Your Experience is Our Greatest Honor', width / 2, y);
    y += 45;

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '26px Georgia, serif';
    ctx.fillText('Scan with smartphone • 10s AI Feedback • Google Maps', width / 2, y);
    return;
  }

  // -------------------------------------------------------------
  // 4. SCANDINAVIAN ARCHITECTURAL NOIR
  // -------------------------------------------------------------
  if (template.layoutType === 'scandi-minimal') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 16;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    ctx.strokeStyle = '#71717a';
    ctx.lineWidth = 2;
    ctx.strokeRect(65, 65, width - 130, height - 130);

    let y = 145;
    ctx.fillStyle = '#52525b';
    ctx.font = 'bold 26px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('[ 5.0 GOOGLE RATED STORE // OFFICIAL PORTAL ]', width / 2, y);

    y += 135;
    drawCircularLogo(ctx, logo, bizName, width / 2, y, 140, '#000000', '#f4f4f5', '#000000');

    y += 105;
    ctx.fillStyle = '#000000';
    ctx.font = '900 62px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(bizName.toUpperCase(), width / 2, y);
    drawVerifiedBadge(ctx, width / 2 + ctx.measureText(bizName.toUpperCase()).width / 2 + 28, y - 18, 16, '#000000');

    y += 42;
    drawRatingPill(ctx, width / 2, y, 420, 70, '#000000', '#000000', '#f4f4f5', '#000000', '5.0 Rating');

    y += 125;
    const qrSize = 640;
    const qx = (width - qrSize) / 2;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.fillRect(qx - 20, y - 20, qrSize + 40, qrSize + 40);
    ctx.strokeRect(qx - 20, y - 20, qrSize + 40, qrSize + 40);

    // L-brackets
    const bLen = 40;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(qx - 35, y - 35 + bLen); ctx.lineTo(qx - 35, y - 35); ctx.lineTo(qx - 35 + bLen, y - 35);
    ctx.moveTo(qx + qrSize + 35 - bLen, y - 35); ctx.lineTo(qx + qrSize + 35, y - 35); ctx.lineTo(qx + qrSize + 35, y - 35 + bLen);
    ctx.moveTo(qx - 35, y + qrSize + 35 - bLen); ctx.lineTo(qx - 35, y + qrSize + 35); ctx.lineTo(qx - 35 + bLen, y + qrSize + 35);
    ctx.moveTo(qx + qrSize + 35 - bLen, y + qrSize + 35); ctx.lineTo(qx + qrSize + 35, y + qrSize + 35); ctx.lineTo(qx + qrSize + 35, y + qrSize + 35 - bLen);
    ctx.stroke();

    await drawQrWithCenterLogo(ctx, qrDataUrl, qx, y, qrSize);
    y += qrSize + 85;

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 40px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('INSTANT MOBILE REVIEW', width / 2, y);
    y += 45;

    ctx.fillStyle = '#71717a';
    ctx.font = '26px "Courier New", monospace';
    ctx.fillText('Fast AI Review Assistant • Direct Google Maps', width / 2, y);
    return;
  }

  // -------------------------------------------------------------
  // 5. EMERALD ECO & WELLNESS CAPSULE
  // -------------------------------------------------------------
  if (template.layoutType === 'emerald-wellness') {
    ctx.fillStyle = '#f0fdf4';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#86efac';
    ctx.lineWidth = 10;
    ctx.strokeRect(36, 36, width - 72, height - 72);

    let y = 145;
    const pillW = 560;
    ctx.fillStyle = '#dcfce7';
    ctx.strokeStyle = '#bbf7d0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect((width - pillW) / 2, y, pillW, 64, 32);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#15803d';
    ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🌿  VERIFIED CLIENT CARE & WELLNESS  🌿', width / 2, y + 42);

    y += 135;
    drawCircularLogo(ctx, logo, bizName, width / 2, y, 140, '#86efac', '#ffffff', '#15803d');

    y += 105;
    ctx.fillStyle = '#064e3b';
    ctx.font = 'bold 56px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(bizName, width / 2, y);
    drawVerifiedBadge(ctx, width / 2 + ctx.measureText(bizName).width / 2 + 28, y - 18, 16, '#15803d');

    y += 42;
    drawRatingPill(ctx, width / 2, y, 420, 70, '#10b981', '#047857', '#ffffff', '#bbf7d0', '5.0 Rating');

    y += 125;
    const qrSize = 640;
    const qx = (width - qrSize) / 2;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#86efac';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.roundRect(qx - 25, y - 25, qrSize + 50, qrSize + 50, 40);
    ctx.fill();
    ctx.stroke();

    await drawQrWithCenterLogo(ctx, qrDataUrl, qx, y, qrSize);
    y += qrSize + 85;

    ctx.fillStyle = '#064e3b';
    ctx.font = 'bold 40px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Share Your Experience With Our Community', width / 2, y);
    y += 45;

    ctx.fillStyle = '#047857';
    ctx.font = '28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Scan with camera to review in 10 seconds • Google Maps', width / 2, y);
    return;
  }

  // -------------------------------------------------------------
  // 6. VINTAGE BISTRO & WOODCRAFT STITCH
  // -------------------------------------------------------------
  if (template.layoutType === 'artisan-vintage') {
    ctx.fillStyle = '#fefce8';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 8;
    ctx.setLineDash([20, 12]);
    ctx.strokeRect(45, 45, width - 90, height - 90);
    ctx.restore();

    let y = 145;
    ctx.fillStyle = '#ca8a04';
    ctx.font = 'bold 30px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('☕  ARTISAN ROAST & LOCAL KITCHEN  ☕', width / 2, y);

    y += 135;
    drawCircularLogo(ctx, logo, bizName, width / 2, y, 140, '#ca8a04', '#ffffff', '#854d0e');

    y += 105;
    ctx.fillStyle = '#422006';
    ctx.font = 'bold 56px Georgia, serif';
    ctx.fillText(bizName, width / 2, y);
    drawVerifiedBadge(ctx, width / 2 + ctx.measureText(bizName).width / 2 + 28, y - 18, 16, '#ca8a04');

    y += 42;
    drawRatingPill(ctx, width / 2, y, 420, 70, '#ca8a04', '#713f12', '#fef08a', '#ca8a04', '5.0 Rating');

    y += 125;
    const qrSize = 640;
    const qx = (width - qrSize) / 2;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.roundRect(qx - 25, y - 25, qrSize + 50, qrSize + 50, 30);
    ctx.fill();
    ctx.stroke();

    await drawQrWithCenterLogo(ctx, qrDataUrl, qx, y, qrSize);
    y += qrSize + 85;

    ctx.fillStyle = '#422006';
    ctx.font = 'bold 42px Georgia, serif';
    ctx.fillText('Loved Your Visit? Review Us!', width / 2, y);
    y += 45;

    ctx.fillStyle = '#713f12';
    ctx.font = '28px Georgia, serif';
    ctx.fillText('We appreciate your friendly local support • Google Maps', width / 2, y);
    return;
  }

  // -------------------------------------------------------------
  // 7. CYBERPUNK HUD & NEON TERMINAL
  // -------------------------------------------------------------
  if (template.layoutType === 'cyber-hud') {
    ctx.fillStyle = '#070b14';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 8;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    let y = 145;
    ctx.fillStyle = '#22d3ee';
    ctx.font = 'bold 26px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('/// HUD ONLINE // GEMINI 3.8 AI SEQUENCE', width / 2, y);

    y += 135;
    drawCircularLogo(ctx, logo, bizName, width / 2, y, 140, '#06b6d4', '#0b1120', '#22d3ee');

    y += 105;
    ctx.fillStyle = '#22d3ee';
    ctx.font = 'bold 58px "Courier New", monospace';
    ctx.fillText(bizName, width / 2, y);
    drawVerifiedBadge(ctx, width / 2 + ctx.measureText(bizName).width / 2 + 28, y - 18, 16, '#06b6d4');

    y += 42;
    drawRatingPill(ctx, width / 2, y, 420, 70, '#06b6d4', '#22d3ee', '#082f49', '#06b6d4', '5.0 Rating');

    y += 125;
    const qrSize = 640;
    const qx = (width - qrSize) / 2;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.roundRect(qx - 25, y - 25, qrSize + 50, qrSize + 50, 24);
    ctx.fill();
    ctx.stroke();

    await drawQrWithCenterLogo(ctx, qrDataUrl, qx, y, qrSize);
    y += qrSize + 85;

    ctx.fillStyle = '#22d3ee';
    ctx.font = 'bold 40px "Courier New", monospace';
    ctx.fillText('POINT CAMERA TO REVIEW', width / 2, y);
    y += 45;

    ctx.fillStyle = '#94a3b8';
    ctx.font = '26px "Courier New", monospace';
    ctx.fillText('DIRECT GOOGLE MAPS TRANSMISSION // 10 SECONDS', width / 2, y);
    return;
  }

  // -------------------------------------------------------------
  // 8. ROSE VELVET & GLAMOUR ARCH
  // -------------------------------------------------------------
  if (template.layoutType === 'rose-boutique') {
    ctx.fillStyle = '#fdf2f8';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 10;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    let y = 145;
    ctx.fillStyle = '#db2777';
    ctx.font = 'bold 28px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('✨  LOVE YOUR EXPERIENCE?  ✨', width / 2, y);

    y += 135;
    drawCircularLogo(ctx, logo, bizName, width / 2, y, 140, '#f472b6', '#ffffff', '#db2777');

    y += 105;
    ctx.fillStyle = '#831843';
    ctx.font = 'bold 56px Georgia, serif';
    ctx.fillText(bizName, width / 2, y);
    drawVerifiedBadge(ctx, width / 2 + ctx.measureText(bizName).width / 2 + 28, y - 18, 16, '#db2777');

    y += 42;
    drawRatingPill(ctx, width / 2, y, 420, 70, '#f59e0b', '#831843', '#ffffff', '#fbcfe8', '5.0 Rating');

    y += 125;
    const qrSize = 640;
    const qx = (width - qrSize) / 2;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.roundRect(qx - 25, y - 25, qrSize + 50, qrSize + 50, 36);
    ctx.fill();
    ctx.stroke();

    await drawQrWithCenterLogo(ctx, qrDataUrl, qx, y, qrSize);
    y += qrSize + 85;

    ctx.fillStyle = '#831843';
    ctx.font = 'bold 40px Georgia, serif';
    ctx.fillText('Scan to Share Your Glow', width / 2, y);
    y += 45;

    ctx.fillStyle = '#db2777';
    ctx.font = '28px Georgia, serif';
    ctx.fillText('Review us on Google Maps in 10 seconds with AI', width / 2, y);
    return;
  }

  // -------------------------------------------------------------
  // 9. DYNAMIC SUNSET BURST
  // -------------------------------------------------------------
  if (template.layoutType === 'dynamic-burst') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const grad = ctx.createLinearGradient(0, 0, width, 480);
    grad.addColorStop(0, '#ea580c');
    grad.addColorStop(0.5, '#f59e0b');
    grad.addColorStop(1, '#ef4444');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, 480);

    let y = 100;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    const pillW = 540;
    ctx.beginPath();
    ctx.roundRect((width - pillW) / 2, y, pillW, 58, 29);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🔥  5-STAR TOP EXPERIENCE  🔥', width / 2, y + 40);

    y += 130;
    drawCircularLogo(ctx, logo, bizName, width / 2, y, 140, '#ffffff', '#ffffff', '#ea580c');

    y += 105;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 56px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(bizName, width / 2, y);
    drawVerifiedBadge(ctx, width / 2 + ctx.measureText(bizName).width / 2 + 28, y - 18, 16, '#ffffff');

    y += 120;
    drawRatingPill(ctx, width / 2, y, 420, 70, '#f59e0b', '#c2410c', '#fff7ed', '#fed7aa', '5.0 Rating');

    y += 115;
    const qrSize = 640;
    const qx = (width - qrSize) / 2;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.roundRect(qx - 25, y - 25, qrSize + 50, qrSize + 50, 30);
    ctx.fill();
    ctx.stroke();

    await drawQrWithCenterLogo(ctx, qrDataUrl, qx, y, qrSize);
    y += qrSize + 85;

    ctx.fillStyle = '#c2410c';
    ctx.font = 'bold 42px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Tap or Scan Camera to Review', width / 2, y);
    y += 45;

    ctx.fillStyle = '#7c2d12';
    ctx.font = '28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Draft your 5-star review in 10 seconds flat! • Google Maps', width / 2, y);
    return;
  }

  // -------------------------------------------------------------
  // 10. CORPORATE COBALT EXECUTIVE
  // -------------------------------------------------------------
  if (template.layoutType === 'executive-navy') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(0, 0, width, 24);

    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 8;
    ctx.strokeRect(36, 44, width - 72, height - 80);

    let y = 145;
    const pillW = 560;
    ctx.fillStyle = '#e0e7ff';
    ctx.beginPath();
    ctx.roundRect((width - pillW) / 2, y, pillW, 64, 32);
    ctx.fill();

    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🛡️  OFFICIAL GOOGLE CLIENT VERIFIED', width / 2, y + 42);

    y += 135;
    drawCircularLogo(ctx, logo, bizName, width / 2, y, 140, '#1e3a8a', '#ffffff', '#1e3a8a');

    y += 105;
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 56px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(bizName, width / 2, y);
    drawVerifiedBadge(ctx, width / 2 + ctx.measureText(bizName).width / 2 + 28, y - 18, 16, '#1e3a8a');

    y += 42;
    drawRatingPill(ctx, width / 2, y, 420, 70, '#f59e0b', '#1e3a8a', '#e0e7ff', '#c7d2fe', '5.0 Rating');

    y += 125;
    const qrSize = 640;
    const qx = (width - qrSize) / 2;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.roundRect(qx - 25, y - 25, qrSize + 50, qrSize + 50, 24);
    ctx.fill();
    ctx.stroke();

    await drawQrWithCenterLogo(ctx, qrDataUrl, qx, y, qrSize);
    y += qrSize + 85;

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 40px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Client Satisfaction Index • Verified Feedback', width / 2, y);
    y += 45;

    ctx.fillStyle = '#64748b';
    ctx.font = '28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Direct Submission to Google Maps • Secure & Fast', width / 2, y);
    return;
  }

  // -------------------------------------------------------------
  // 11. DENTAL & MEDICAL PURE CLINIC
  // -------------------------------------------------------------
  if (template.layoutType === 'dental-clinic') {
    ctx.fillStyle = '#f0fdfa';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#0284c7';
    ctx.fillRect(0, 0, width, 130);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✚  HEALTHCARE & PATIENT EXCELLENCE  ✚', width / 2, 80);

    ctx.strokeStyle = '#bae6fd';
    ctx.lineWidth = 8;
    ctx.strokeRect(36, 160, width - 72, height - 196);

    let y = 230;
    drawCircularLogo(ctx, logo, bizName, width / 2, y, 140, '#0284c7', '#ffffff', '#0284c7');

    y += 105;
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 56px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(bizName, width / 2, y);
    drawVerifiedBadge(ctx, width / 2 + ctx.measureText(bizName).width / 2 + 28, y - 18, 16, '#0284c7');

    y += 42;
    drawRatingPill(ctx, width / 2, y, 420, 70, '#f59e0b', '#0284c7', '#e0f2fe', '#bae6fd', '5.0 Rating');

    y += 115;
    const qrSize = 640;
    const qx = (width - qrSize) / 2;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.roundRect(qx - 25, y - 25, qrSize + 50, qrSize + 50, 32);
    ctx.fill();
    ctx.stroke();

    await drawQrWithCenterLogo(ctx, qrDataUrl, qx, y, qrSize);
    y += qrSize + 85;

    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 38px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Point Camera to Leave 5-Star Review', width / 2, y);
    y += 45;

    ctx.fillStyle = '#64748b';
    ctx.font = '28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Please share your consultation experience on Google Maps', width / 2, y);
    return;
  }

  // -------------------------------------------------------------
  // 12. MOTORSPORT CARBON WEAVE (AUTOMOTIVE & GARAGE)
  // -------------------------------------------------------------
  if (template.layoutType === 'carbon-auto') {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#dc2626';
    ctx.fillRect(0, 0, width, 24);
    ctx.fillRect(0, height - 24, width, 24);

    let y = 145;
    const badgeW = 600;
    ctx.fillStyle = '#450a0a';
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect((width - badgeW) / 2, y, badgeW, 64, 32);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f87171';
    ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏎️  MOTORSPORT PRECISION SERVICE  🏎️', width / 2, y + 42);

    y += 135;
    drawCircularLogo(ctx, logo, bizName, width / 2, y, 140, '#dc2626', '#1e293b', '#ef4444');

    y += 105;
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 58px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(bizName.toUpperCase(), width / 2, y);
    drawVerifiedBadge(ctx, width / 2 + ctx.measureText(bizName.toUpperCase()).width / 2 + 28, y - 18, 16, '#dc2626');

    y += 42;
    drawRatingPill(ctx, width / 2, y, 420, 70, '#f59e0b', '#f87171', '#450a0a', '#b91c1c', '5.0 Rating');

    y += 125;
    const qrSize = 640;
    const qx = (width - qrSize) / 2;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(qx - 20, y - 20, qrSize + 40, qrSize + 40);

    // Red calipers
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 8;
    const cLen = 35;
    ctx.beginPath();
    ctx.moveTo(qx - 20, y - 20 + cLen); ctx.lineTo(qx - 20, y - 20); ctx.lineTo(qx - 20 + cLen, y - 20);
    ctx.moveTo(qx + qrSize + 20 - cLen, y - 20); ctx.lineTo(qx + qrSize + 20, y - 20); ctx.lineTo(qx + qrSize + 20, y - 20 + cLen);
    ctx.moveTo(qx - 20, y + qrSize + 20 - cLen); ctx.lineTo(qx - 20, y + qrSize + 20); ctx.lineTo(qx - 20 + cLen, y + qrSize + 20);
    ctx.moveTo(qx + qrSize + 20 - cLen, y + qrSize + 20); ctx.lineTo(qx + qrSize + 20, y + qrSize + 20); ctx.lineTo(qx + qrSize + 20, y + qrSize + 20 - cLen);
    ctx.stroke();

    await drawQrWithCenterLogo(ctx, qrDataUrl, qx, y, qrSize);
    y += qrSize + 85;

    ctx.fillStyle = '#f87171';
    ctx.font = 'bold 38px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('RATE OUR SPEED & SERVICE', width / 2, y);
    y += 45;

    ctx.fillStyle = '#94a3b8';
    ctx.font = '28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('⚡ 10-Second Quick Google Review', width / 2, y);
    return;
  }

  // -------------------------------------------------------------
  // 13. AUTHENTIC ITALIAN TRATTORIA & PIZZERIA
  // -------------------------------------------------------------
  if (template.layoutType === 'pizzeria-rustic') {
    ctx.fillStyle = '#fffbeb';
    ctx.fillRect(0, 0, width, height);

    const fW = width / 3;
    ctx.fillStyle = '#15803d'; ctx.fillRect(0, 0, fW, 26);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(fW, 0, fW, 26);
    ctx.fillStyle = '#b91c1c'; ctx.fillRect(fW * 2, 0, fW, 26);

    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 6;
    ctx.strokeRect(36, 56, width - 72, height - 92);

    let y = 145;
    const badgeW = 560;
    ctx.fillStyle = '#fef3c7';
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect((width - badgeW) / 2, y, badgeW, 64, 32);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#92400e';
    ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🍕  AUTENTICO GUSTO ITALIANO  🍕', width / 2, y + 42);

    y += 135;
    drawCircularLogo(ctx, logo, bizName, width / 2, y, 140, '#d97706', '#ffffff', '#b91c1c');

    y += 105;
    ctx.fillStyle = '#78350f';
    ctx.font = 'bold 56px Georgia, serif';
    ctx.fillText(bizName, width / 2, y);
    drawVerifiedBadge(ctx, width / 2 + ctx.measureText(bizName).width / 2 + 28, y - 18, 16, '#15803d');

    y += 42;
    drawRatingPill(ctx, width / 2, y, 420, 70, '#d97706', '#92400e', '#fef3c7', '#fde68a', '5.0 Rating');

    y += 125;
    const qrSize = 640;
    const qx = (width - qrSize) / 2;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#b91c1c';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.roundRect(qx - 25, y - 25, qrSize + 50, qrSize + 50, 32);
    ctx.fill();
    ctx.stroke();

    await drawQrWithCenterLogo(ctx, qrDataUrl, qx, y, qrSize);
    y += qrSize + 85;

    ctx.fillStyle = '#b91c1c';
    ctx.font = 'bold 38px Georgia, serif';
    ctx.fillText('Buon Appetito! Loved The Taste?', width / 2, y);
    y += 45;

    ctx.fillStyle = '#78350f';
    ctx.font = 'italic 30px Georgia, serif';
    ctx.fillText('Grazie Mille per la Visita! • Google Maps', width / 2, y);
    return;
  }

  // -------------------------------------------------------------
  // 14. IRON VOLT ATHLETIC & GYM
  // -------------------------------------------------------------
  if (template.layoutType === 'fitness-volt') {
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#84cc16';
    ctx.fillRect(0, 0, width, 120);

    ctx.fillStyle = '#09090b';
    ctx.font = '900 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ IRON PERFORMANCE FITNESS & GYM ⚡', width / 2, 75);

    let y = 220;
    drawCircularLogo(ctx, logo, bizName, width / 2, y, 140, '#84cc16', '#18181b', '#84cc16');

    y += 105;
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 60px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(bizName.toUpperCase(), width / 2, y);
    drawVerifiedBadge(ctx, width / 2 + ctx.measureText(bizName.toUpperCase()).width / 2 + 28, y - 18, 16, '#84cc16');

    y += 42;
    drawRatingPill(ctx, width / 2, y, 420, 70, '#84cc16', '#84cc16', '#18181b', '#84cc16', '5.0 Rating');

    y += 125;
    const qrSize = 640;
    const qx = (width - qrSize) / 2;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#84cc16';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.roundRect(qx - 25, y - 25, qrSize + 50, qrSize + 50, 24);
    ctx.fill();
    ctx.stroke();

    await drawQrWithCenterLogo(ctx, qrDataUrl, qx, y, qrSize);
    y += qrSize + 85;

    ctx.fillStyle = '#84cc16';
    ctx.font = '900 40px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('CRUSHED YOUR WORKOUT TODAY?', width / 2, y);
    y += 45;

    ctx.fillStyle = '#a1a1aa';
    ctx.font = '28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('💪 Point Phone Camera To Rate Instantly on Google', width / 2, y);
    return;
  }

  // -------------------------------------------------------------
  // 15. PEARL & DIAMOND HAUTE JOAILLERIE
  // -------------------------------------------------------------
  if (template.layoutType === 'diamond-luxury') {
    ctx.fillStyle = '#fafaf9';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 8;
    ctx.strokeRect(36, 36, width - 72, height - 72);
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 3;
    ctx.strokeRect(52, 52, width - 104, height - 104);

    let y = 145;
    const badgeW = 600;
    ctx.fillStyle = '#fef3c7';
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect((width - badgeW) / 2, y, badgeW, 60, 30);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#b45309';
    ctx.font = 'bold 24px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('💎  HAUTE JOAILLERIE & DISTINCTION  💎', width / 2, y + 38);

    y += 135;
    drawCircularLogo(ctx, logo, bizName, width / 2, y, 140, '#d97706', '#ffffff', '#b45309');

    y += 105;
    ctx.fillStyle = '#1c1917';
    ctx.font = 'bold 56px Georgia, serif';
    ctx.fillText(bizName, width / 2, y);
    drawVerifiedBadge(ctx, width / 2 + ctx.measureText(bizName).width / 2 + 28, y - 18, 16, '#d97706');

    y += 42;
    drawRatingPill(ctx, width / 2, y, 420, 70, '#d97706', '#b45309', '#ffffff', '#fde68a', '5.0 Rating');

    y += 125;
    const qrSize = 640;
    const qx = (width - qrSize) / 2;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.roundRect(qx - 25, y - 25, qrSize + 50, qrSize + 50, 32);
    ctx.fill();
    ctx.stroke();

    await drawQrWithCenterLogo(ctx, qrDataUrl, qx, y, qrSize);
    y += qrSize + 85;

    ctx.fillStyle = '#292524';
    ctx.font = 'bold 36px Georgia, serif';
    ctx.fillText('Thank You For Choosing Excellence', width / 2, y);
    y += 45;

    ctx.fillStyle = '#78716c';
    ctx.font = '26px Georgia, serif';
    ctx.fillText('Pure Client Distinction • Verified Google Maps', width / 2, y);
    return;
  }

  // -------------------------------------------------------------
  // 16. GENTLEMEN'S BARBER & LOUNGE
  // -------------------------------------------------------------
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#dc2626';
  ctx.fillRect(0, 0, width, 24);

  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 8;
  ctx.strokeRect(36, 48, width - 72, height - 84);

  let y = 145;
  const badgeW = 620;
  ctx.fillStyle = '#451a03';
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect((width - badgeW) / 2, y, badgeW, 64, 32);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#fde68a';
  ctx.font = 'bold 28px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('✂  GENTLEMEN\'S GROOMING & SHAVE  ✂', width / 2, y + 42);

  y += 135;
  drawCircularLogo(ctx, logo, bizName, width / 2, y, 140, '#d97706', '#292524', '#f59e0b');

  y += 105;
  ctx.fillStyle = '#fef3c7';
  ctx.font = 'bold 58px Georgia, serif';
  ctx.fillText(bizName.toUpperCase(), width / 2, y);
  drawVerifiedBadge(ctx, width / 2 + ctx.measureText(bizName.toUpperCase()).width / 2 + 28, y - 18, 16, '#f59e0b');

  y += 42;
  drawRatingPill(ctx, width / 2, y, 420, 70, '#f59e0b', '#fde68a', '#292524', '#b45309', '5.0 Rating');

  y += 125;
  const qrSize = 640;
  const qx = (width - qrSize) / 2;
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.roundRect(qx - 25, y - 25, qrSize + 50, qrSize + 50, 24);
  ctx.fill();
  ctx.stroke();

  await drawQrWithCenterLogo(ctx, qrDataUrl, qx, y, qrSize);
  y += qrSize + 85;

  ctx.fillStyle = '#fde68a';
  ctx.font = 'bold 38px Georgia, serif';
  ctx.fillText('A Cut Above The Rest', width / 2, y);
  y += 45;

  ctx.fillStyle = '#a8a29e';
  ctx.font = '28px Georgia, serif';
  ctx.fillText('Craftsmanship • Precision • Heritage • Google Maps', width / 2, y);
}
