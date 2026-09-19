import jsQR from 'jsqr';

export interface ExtractedMemberData {
  raw: string;
  cardId?: string;
  fullName?: string;
  fullNameUr?: string;
  fatherName?: string;
  fatherNameUr?: string;
  caste?: string;
  cnic?: string;
  dob?: string;
  gender?: string;
  membershipType?: string;
  phone?: string;
  email?: string;
  address?: string;
  occupation?: string;
  education?: string;
  residentialStatus?: string;
  verificationUrl?: string;
  issuedDate?: string;
  authority?: string;
}

/**
 * Parses raw text payload from a scanned QR code into structured member fields
 */
export function parseQrPayload(data: string): ExtractedMemberData {
  const result: ExtractedMemberData = { raw: data.trim() };

  // 1. Check for verification URL parameter (?verify=AB-26-XXXXXX)
  const urlParamMatch = data.match(/[?&]verify=([A-Za-z0-9\-_]+)/i);
  if (urlParamMatch) {
    result.cardId = urlParamMatch[1].toUpperCase();
    result.verificationUrl = data.trim();
  } else if (data.startsWith('http://') || data.startsWith('https://')) {
    result.verificationUrl = data.trim();
    try {
      const urlObj = new URL(data);
      const v = urlObj.searchParams.get('verify');
      if (v) result.cardId = v.toUpperCase();
    } catch {
      // Ignored
    }
  }

  // 2. Parse structured lines
  const lines = data.split('\n').map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    // Card ID match
    if (!result.cardId) {
      if (/^(?:Card\s*ID|Card\s*No|Card\s*#|Member\s*ID|کارڈ\s*نمبر|رکنیت\s*نمبر)[:\-#\s]*(.+)$/i.test(line)) {
        result.cardId = line.replace(/^(?:Card\s*ID|Card\s*No|Card\s*#|Member\s*ID|کارڈ\s*نمبر|رکنیت\s*نمبر)[:\-#\s]*/i, '').trim().toUpperCase();
      } else if (/^[A-Z]{2,6}-\d{2}-[A-Z0-9]{4,10}$/i.test(line)) {
        result.cardId = line.toUpperCase();
      } else {
        const embeddedId = line.match(/\b([A-Z]{2,6}-\d{2}-[A-Z0-9]{4,10})\b/i);
        if (embeddedId) {
          result.cardId = embeddedId[1].toUpperCase();
        }
      }
    }

    // Full Name
    if (/^Full Name.*:\s*(.+)$/i.test(line)) {
      result.fullName = line.replace(/^Full Name.*:\s*/i, '').trim();
    } else if (/^نام.*:\s*(.+)$/i.test(line)) {
      result.fullNameUr = line.replace(/^نام.*:\s*/i, '').trim();
    }

    // Father Name
    if (/^Father.*:\s*(.+)$/i.test(line)) {
      result.fatherName = line.replace(/^Father.*:\s*/i, '').trim();
    } else if (/^ولدیت.*:\s*(.+)$/i.test(line)) {
      result.fatherNameUr = line.replace(/^ولدیت.*:\s*/i, '').trim();
    }

    // Caste / Tribe (قومیت)
    if (/^(Caste|قومیت).*:\s*(.+)$/i.test(line)) {
      result.caste = line.replace(/^(Caste|قومیت).*:\s*/i, '').trim();
    }

    // CNIC
    if (/^CNIC:\s*(.+)$/i.test(line)) {
      result.cnic = line.replace(/^CNIC:\s*/i, '').trim();
    }

    // Date of Birth
    if (/^DOB:\s*(.+)$/i.test(line)) {
      result.dob = line.replace(/^DOB:\s*/i, '').trim();
    }

    // Gender
    if (/^Gender:\s*(.+)$/i.test(line)) {
      result.gender = line.replace(/^Gender:\s*/i, '').trim();
    }

    // Membership Category
    if (/^Membership Type:\s*(.+)$/i.test(line)) {
      result.membershipType = line.replace(/^Membership Type:\s*/i, '').trim();
    }

    // Contact
    if (/^(WhatsApp|Phone|Contact).*:\s*(.+)$/i.test(line)) {
      result.phone = line.replace(/^(WhatsApp|Phone|Contact).*:\s*/i, '').trim();
    }

    // Email
    if (/^Email:\s*(.+)$/i.test(line)) {
      result.email = line.replace(/^Email:\s*/i, '').trim();
    }

    // Address (English line only - the Urdu address line uses a different label)
    if (/^Address\s*\(English\).*:\s*(.+)$/i.test(line)) {
      result.address = line.replace(/^Address\s*\(English\).*:\s*/i, '').trim();
    } else if (/^Address.*:\s*(.+)$/i.test(line)) {
      result.address = line.replace(/^Address.*:\s*/i, '').trim();
    }

    // Education
    if (/^Education:\s*(.+)$/i.test(line)) {
      result.education = line.replace(/^Education:\s*/i, '').trim();
    }

    // Occupation / Work
    if (/^Occupation.*:\s*(.+)$/i.test(line)) {
      result.occupation = line.replace(/^Occupation.*:\s*/i, '').trim();
    }

    // Residential Status
    if (/^Residential Status:\s*(.+)$/i.test(line)) {
      result.residentialStatus = line.replace(/^Residential Status:\s*/i, '').trim();
    }

    // Authority
    if (/^Authority:\s*(.+)$/i.test(line)) {
      result.authority = line.replace(/^Authority:\s*/i, '').trim();
    }

    // Issued / Issue Date - the real, one-time-stamped approval date. Must
    // be read from here (when present) rather than defaulting to the
    // scan/search moment, which was the original bug.
    if (/^Issued\s*Date:\s*(.+)$/i.test(line)) {
      result.issuedDate = line.replace(/^Issued\s*Date:\s*/i, '').trim();
    }
  }

  return result;
}

/**
 * Scans an HTML canvas element for a QR code using jsQR
 */
export function scanQrFromCanvas(
  canvas: HTMLCanvasElement
): { data: string; extracted: ExtractedMemberData } | null {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const code = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: 'attemptBoth',
  });

  if (code && code.data) {
    return {
      data: code.data,
      extracted: parseQrPayload(code.data),
    };
  }

  return null;
}

/**
 * Scans an image file (uploaded by user) for a QR code
 */
export async function scanQrFromImageFile(
  file: File
): Promise<{ data: string; extracted: ExtractedMemberData } | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Cap max size for performance
        let width = img.naturalWidth;
        let height = img.naturalHeight;
        if (width > 1200) {
          height = Math.round((height * 1200) / width);
          width = 1200;
        }
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve(null);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const result = scanQrFromCanvas(canvas);
        resolve(result);
      };
      img.onerror = () => reject(new Error('Failed to load image file'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Verifies a generated QR Code Data URL by decoding it and comparing
 */
export async function testDecodeQrDataUrl(
  dataUrl: string
): Promise<{ success: boolean; scannedData: string; extracted: ExtractedMemberData }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      const result = scanQrFromCanvas(canvas);
      if (result) {
        resolve({
          success: true,
          scannedData: result.data,
          extracted: result.extracted,
        });
      } else {
        resolve({
          success: false,
          scannedData: '',
          extracted: { raw: '' },
        });
      }
    };
    img.onerror = () => reject(new Error('Invalid QR image data URL'));
    img.src = dataUrl;
  });
}
