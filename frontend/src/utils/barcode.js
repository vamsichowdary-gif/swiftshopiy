// Code 128B barcode pattern generator in pure JavaScript
const CODE128_PATTERNS = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213",
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132",
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211",
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331",
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111",
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214",
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141",
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141",
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112"
];

const START_CODE_B = 104;
const STOP_CODE = 106;

export function generateBarcodeSvg(text, options = {}) {
  const safeText = String(text || "00000000").replace(/[^\x20-\x7E]/g, "");
  const height = options.height || 54;
  const barWidth = options.barWidth || 2;
  const showText = options.showText !== false;
  const color = options.color || "#0f172a";
  const bg = options.bg || "transparent";

  // Calculate Code 128 check digit
  let checksum = START_CODE_B;
  const codes = [START_CODE_B];

  for (let i = 0; i < safeText.length; i++) {
    const code = safeText.charCodeAt(i) - 32;
    codes.push(code);
    checksum += code * (i + 1);
  }

  const checkDigit = checksum % 103;
  codes.push(checkDigit);
  codes.push(STOP_CODE);

  // Build binary bars
  let binary = "";
  for (const code of codes) {
    const pattern = CODE128_PATTERNS[code] || CODE128_PATTERNS[0];
    let isBar = true;
    for (const char of pattern) {
      const width = parseInt(char, 10);
      binary += (isBar ? "1" : "0").repeat(width);
      isBar = !isBar;
    }
  }

  const totalWidth = binary.length * barWidth;
  const totalHeight = showText ? height + 18 : height;

  let rects = "";
  let currentX = 0;
  for (let i = 0; i < binary.length; i++) {
    if (binary[i] === "1") {
      rects += `<rect x="${currentX}" y="0" width="${barWidth}" height="${height}" fill="${color}" />`;
    }
    currentX += barWidth;
  }

  // Format display text with spaced grouping
  const displayText = safeText.split("").join(" ");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" width="${totalWidth}" height="${totalHeight}" style="background:${bg};max-width:100%;height:auto;display:block;margin:auto;">
    ${rects}
    ${showText ? `<text x="${totalWidth / 2}" y="${height + 14}" fill="${color}" font-family="monospace, sans-serif" font-size="11" font-weight="700" letter-spacing="2" text-anchor="middle">${displayText}</text>` : ""}
  </svg>`;
}

// Generates an Order and Invoice ID pair
export function generateOrderIdentifiers(orderId) {
  const num = parseInt(orderId, 10) || Math.floor(10000 + Math.random() * 90000);
  const padded = String(num).padStart(6, "0");
  const year = new Date().getFullYear();
  return {
    orderIdFormatted: `ORD-${year}-${padded}`,
    invoiceId: `INV-${year}-${padded}`,
    barcodeCode: `7891${padded}${year % 100}10`,
  };
}
