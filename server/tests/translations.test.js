// ===================================================================
// FixNear Trust - Automated Translation Parity & Coverage Tests
// Verifies 100% key parity across EN, HI, MR, no empty strings,
// AST JSX scanning for untranslated text, error codes & email localization
// ===================================================================

import { describe, it, expect } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';
import { i18n, getErrorMessage, getStatusLabel } from '../../src/i18n/translations.js';
import { scanAll } from '../../scripts/scan-jsx-translations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, '../../src');
import {
  sendWelcomeEmail,
  sendBookingPlacedEmail,
  sendJobCompletedEmail,
  sendBookingCancelledEmail,
} from '../utils/emailHelper.js';

describe('i18n Translation Integrity & Parity', () => {
  it('should have en, hi, and mr translation dictionaries loaded', () => {
    expect(i18n.en).toBeDefined();
    expect(i18n.hi).toBeDefined();
    expect(i18n.mr).toBeDefined();
    expect(typeof i18n.en).toBe('object');
    expect(typeof i18n.hi).toBe('object');
    expect(typeof i18n.mr).toBe('object');
  });

  it('should have 100% key parity between English, Hindi, and Marathi with no empty strings', () => {
    const missingInHi = [];
    const missingInMr = [];
    const emptyInEn = [];
    const emptyInHi = [];
    const emptyInMr = [];

    function checkObject(enObj, hiObj, mrObj, currentPath = '') {
      for (const key of Object.keys(enObj)) {
        const fullPath = currentPath ? `${currentPath}.${key}` : key;
        const enVal = enObj[key];
        const hiVal = hiObj ? hiObj[key] : undefined;
        const mrVal = mrObj ? mrObj[key] : undefined;

        if (hiVal === undefined) {
          missingInHi.push(fullPath);
        }
        if (mrVal === undefined) {
          missingInMr.push(fullPath);
        }

        if (typeof enVal === 'object' && enVal !== null && !Array.isArray(enVal)) {
          checkObject(enVal, hiVal || {}, mrVal || {}, fullPath);
        } else {
          // Leaf node check for non-empty string
          if (typeof enVal === 'string' && enVal.trim() === '') {
            emptyInEn.push(fullPath);
          }
          if (typeof hiVal === 'string' && hiVal.trim() === '') {
            emptyInHi.push(fullPath);
          }
          if (typeof mrVal === 'string' && mrVal.trim() === '') {
            emptyInMr.push(fullPath);
          }
        }
      }
    }

    checkObject(i18n.en, i18n.hi, i18n.mr);

    expect(missingInHi, `Keys present in EN but missing in HI: ${missingInHi.slice(0, 10).join(', ')}`).toEqual([]);
    expect(missingInMr, `Keys present in EN but missing in MR: ${missingInMr.slice(0, 10).join(', ')}`).toEqual([]);
    expect(emptyInEn, `Empty strings in EN: ${emptyInEn.join(', ')}`).toEqual([]);
    expect(emptyInHi, `Empty strings in HI: ${emptyInHi.join(', ')}`).toEqual([]);
    expect(emptyInMr, `Empty strings in MR: ${emptyInMr.join(', ')}`).toEqual([]);
  });

  it('should pass AST JSX Translation Scanner with zero untranslated text across all components', () => {
    const issues = scanAll(srcDir);
    if (issues.length > 0) {
      const summary = issues.map((iss) => `${iss.file}:${iss.line} [${iss.type}] "${iss.text}"`).slice(0, 20).join('\n');
      expect(issues.length, `Found ${issues.length} untranslated strings in src/:\n${summary}`).toBe(0);
    } else {
      expect(issues.length).toBe(0);
    }
  });

  it('should translate booking statuses across EN, HI, MR', () => {
    const statuses = ['REQUESTED', 'ACCEPTED', 'ON_THE_WAY', 'WORKING', 'COMPLETED', 'CANCELLED'];
    for (const status of statuses) {
      expect(i18n.en.status[status], `Missing status ${status} in EN`).toBeDefined();
      expect(i18n.hi.status[status], `Missing status ${status} in HI`).toBeDefined();
      expect(i18n.mr.status[status], `Missing status ${status} in MR`).toBeDefined();
    }
  });

  it('should resolve server error codes properly via getErrorMessage', () => {
    const commonCodes = [
      'BOOKING_NO_PROVIDER',
      'PASSWORD_TOO_WEAK',
      'EMAIL_EXISTS',
      'INVALID_CREDENTIALS',
      'INVALID_FINISH_CODE',
      'NO_ACTIVE_OFFER',
    ];

    for (const code of commonCodes) {
      expect(i18n.en.errors[code], `Missing error code ${code} in EN`).toBeDefined();
      expect(i18n.hi.errors[code], `Missing error code ${code} in HI`).toBeDefined();
      expect(i18n.mr.errors[code], `Missing error code ${code} in MR`).toBeDefined();

      const resolved = getErrorMessage(code);
      expect(resolved).toBeTruthy();
      expect(resolved).not.toBe(code);
    }
  });

  it('should send localized transactional emails in en, hi, and mr', async () => {
    const langs = ['en', 'hi', 'mr'];

    for (const lang of langs) {
      // 1. Welcome Email
      const welcomeRes = await sendWelcomeEmail({
        userEmail: `test-${lang}@example.com`,
        userName: 'Aarav Sharma',
        role: 'customer',
        lang,
      });
      expect(welcomeRes.success).toBe(true);

      // 2. Booking Placed / Confirmed Email
      const bookingRes = await sendBookingPlacedEmail({
        customerEmail: `test-${lang}@example.com`,
        customerName: 'Aarav Sharma',
        bookingId: 'BK-1001',
        serviceTitle: 'AC Servicing',
        scheduledDate: '2026-11-15',
        timeSlot: '10:00 AM',
        price: 499,
        lang,
      });
      expect(bookingRes.success).toBe(true);

      // 3. Payment Received / Completed Email
      const completedRes = await sendJobCompletedEmail({
        customerEmail: `test-${lang}@example.com`,
        customerName: 'Aarav Sharma',
        bookingId: 'BK-1001',
        serviceTitle: 'AC Servicing',
        totalAmount: 548,
        invoiceNumber: 'INV-2026-000001',
        paymentMethod: 'ONLINE',
        lang,
      });
      expect(completedRes.success).toBe(true);

      // 4. Cancellation Email
      const cancelRes = await sendBookingCancelledEmail({
        customerEmail: `test-${lang}@example.com`,
        customerName: 'Aarav Sharma',
        bookingId: 'BK-1001',
        serviceTitle: 'AC Servicing',
        reason: 'Customer rescheduled trip',
        lang,
      });
      expect(cancelRes.success).toBe(true);
    }
  });
});
