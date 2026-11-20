import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { app } from '../server.js';
import { User } from '../models/User.js';
import { Provider } from '../models/Provider.js';
import { Upload } from '../models/Upload.js';
import { AuditLog } from '../models/AuditLog.js';
import {
  isValidKycPublicId,
  resolveLocalKycPath,
  deletePrivateDocument,
  getUploadsPrivateRoot,
} from '../utils/documentStorage.js';
import { fixKycPaths } from '../scripts/fixKycPaths.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mongod;
let providerUserA, providerDocA, providerCookieA;
let providerUserB, providerDocB, providerCookieB;
let customerUser, customerCookie;
let adminUser, adminCookie;

const TINY_PNG_BUFFER = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

const makeAuthCookie = (user) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'test_jwt_secret_key_32_characters_min', {
    expiresIn: '1d',
  });
  return [`token=${token}`];
};

beforeAll(async () => {
  mongod = await MongoMemoryServer.create({
    instance: {
      dbName: 'fixnear_security_test',
    },
  });
  const uri = mongod.getUri();
  await mongoose.connect(uri);
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
}, 60000);

beforeEach(async () => {
  await User.deleteMany({});
  await Provider.deleteMany({});
  await Upload.deleteMany({});
  await AuditLog.collection.deleteMany({});

  // 1. Create Provider A
  providerUserA = await User.create({
    name: 'Provider Alice',
    email: 'alice@fixnear.test',
    phone: '9876543201',
    password: 'Password123!',
    role: 'provider',
    city: 'Mumbai',
  });
  providerDocA = await Provider.create({
    userId: providerUserA._id,
    name: providerUserA.name,
    email: providerUserA.email,
    phone: providerUserA.phone,
    city: 'Mumbai',
    specialty: 'Plumbing',
    status: 'take_skill_test',
  });
  providerCookieA = makeAuthCookie(providerUserA);

  // 2. Create Provider B
  providerUserB = await User.create({
    name: 'Provider Bob',
    email: 'bob@fixnear.test',
    phone: '9876543202',
    password: 'Password123!',
    role: 'provider',
    city: 'Mumbai',
  });
  providerDocB = await Provider.create({
    userId: providerUserB._id,
    name: providerUserB.name,
    email: providerUserB.email,
    phone: providerUserB.phone,
    city: 'Mumbai',
    specialty: 'Electrical',
    status: 'take_skill_test',
  });
  providerCookieB = makeAuthCookie(providerUserB);

  // 3. Create Customer
  customerUser = await User.create({
    name: 'Customer Charlie',
    email: 'charlie@fixnear.test',
    phone: '9876543203',
    password: 'Password123!',
    role: 'customer',
    city: 'Mumbai',
  });
  customerCookie = makeAuthCookie(customerUser);

  // 4. Create Admin
  adminUser = await User.create({
    name: 'Admin Dave',
    email: 'admin.dave@fixnear.test',
    phone: '9876543204',
    password: 'Password123!',
    role: 'admin',
    city: 'Mumbai',
  });
  adminCookie = makeAuthCookie(adminUser);
});

describe('KYC Document Path Traversal & Security Hardening', () => {
  describe('1. Path Traversal & Format Validation (isValidKycPublicId & resolveLocalKycPath)', () => {
    it('rejects traversal payloads and malformed publicIds via isValidKycPublicId', () => {
      const userId = String(providerUserA._id);

      // Traversal with ..
      expect(isValidKycPublicId(`fixnear_kyc_private/${userId}/../../.env`, userId)).toBe(false);
      expect(isValidKycPublicId(`fixnear_kyc_private/${userId}/../secret.txt`, userId)).toBe(false);

      // URL encoded traversal
      expect(isValidKycPublicId(`fixnear_kyc_private/${userId}/..%2f..%2f.env`, userId)).toBe(false);
      expect(isValidKycPublicId(`fixnear_kyc_private/${userId}/%2e%2e%2f.env`, userId)).toBe(false);

      // Cross-user traversal
      const otherUserId = String(providerUserB._id);
      expect(isValidKycPublicId(`fixnear_kyc_private/${userId}/../${otherUserId}/doc.jpg`, userId)).toBe(false);

      // Absolute paths
      expect(isValidKycPublicId('/etc/passwd', userId)).toBe(false);
      expect(isValidKycPublicId('C:\\Windows\\system.ini', userId)).toBe(false);

      // Backslashes
      expect(isValidKycPublicId(`fixnear_kyc_private\\${userId}\\doc.jpg`, userId)).toBe(false);
      expect(isValidKycPublicId(`fixnear_kyc_private/${userId}\\doc.jpg`, userId)).toBe(false);

      // Valid format
      expect(isValidKycPublicId(`fixnear_kyc_private/${userId}/id_proof_123.jpg`, userId)).toBe(true);
      expect(isValidKycPublicId(`fixnear_kyc_private/${userId}/cert_456.pdf`, userId)).toBe(true);

      // Wrong user
      expect(isValidKycPublicId(`fixnear_kyc_private/${otherUserId}/id_proof_123.jpg`, userId)).toBe(false);
    });

    it('throws errors on traversal attempts in resolveLocalKycPath', () => {
      const userId = String(providerUserA._id);
      expect(() => resolveLocalKycPath(`fixnear_kyc_private/${userId}/../../.env`, userId)).toThrow();
      expect(() => resolveLocalKycPath(`fixnear_kyc_private/${userId}/..%2f..%2f.env`, userId)).toThrow();
      expect(() => resolveLocalKycPath(`/etc/passwd`, userId)).toThrow();
      expect(() => resolveLocalKycPath(`fixnear_kyc_private\\${userId}\\test.png`, userId)).toThrow();
    });

    it('rejects registration with traversal payloads returning 400', async () => {
      const userId = String(providerUserA._id);

      const payloads = [
        `../../.env`,
        `fixnear_kyc_private/${userId}/../../.env`,
        `fixnear_kyc_private/${userId}/..%2f..%2f.env`,
        `fixnear_kyc_private/${userId}/../${providerUserB._id}/x.jpg`,
        `/etc/passwd`,
        `C:\\Windows\\system.ini`,
        `fixnear_kyc_private\\${userId}\\x.jpg`,
        `fixnear_kyc_private/${userId}\\x.jpg`,
      ];

      for (const payload of payloads) {
        const res = await request(app)
          .post('/api/providers/register')
          .set('Cookie', providerCookieA)
          .send({
            idProofPublicId: payload,
          });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
      }
    });
  });

  describe('2. Document Ownership & Upload Record Verification', () => {
    it('prevents Provider B from referencing Provider A uploaded document', async () => {
      // Step 1: Provider A legitimately uploads an ID proof
      const uploadResA = await request(app)
        .post('/api/upload/private')
        .set('Cookie', providerCookieA)
        .field('docType', 'idProof')
        .attach('file', TINY_PNG_BUFFER, { filename: 'alice_id.png', contentType: 'image/png' });

      expect(uploadResA.status).toBe(200);
      const publicIdA = uploadResA.body.publicId;
      expect(publicIdA).toBeDefined();

      // Step 2: Provider B attempts to register using Provider A's publicId
      const attackRes1 = await request(app)
        .post('/api/providers/register')
        .set('Cookie', providerCookieB)
        .send({
          idProofPublicId: publicIdA,
        });

      // Must be rejected with 400 because publicIdA is not in Provider B's private folder
      expect(attackRes1.status).toBe(400);
      expect(attackRes1.body.message).toContain('private folder');

      // Step 3: Provider B constructs a publicId under their own folder without uploading
      const fakePublicIdB = `fixnear_kyc_private/${providerUserB._id}/fabricated_doc.jpg`;
      const attackRes2 = await request(app)
        .post('/api/providers/register')
        .set('Cookie', providerCookieB)
        .send({
          idProofPublicId: fakePublicIdB,
        });

      // Must be rejected with 400 because no authentic Upload record exists
      expect(attackRes2.status).toBe(400);
      expect(attackRes2.body.message).toContain('upload record not found');
    });
  });

  describe('3. Safe Document Replacement & External Sentinel File Protection', () => {
    it('replacing a document deletes only the provider own file and never touches an external sentinel file', async () => {
      const uploadsRoot = getUploadsPrivateRoot();
      const sentinelPath = path.join(uploadsRoot, 'sentinel_security_check.txt');

      // Create an external sentinel file outside the provider's folder
      fs.writeFileSync(sentinelPath, 'CRITICAL_SENTINEL_DATA_MUST_NOT_BE_DELETED');
      expect(fs.existsSync(sentinelPath)).toBe(true);

      try {
        // Step 1: Provider A uploads document 1
        const upload1 = await request(app)
          .post('/api/upload/private')
          .set('Cookie', providerCookieA)
          .field('docType', 'idProof')
          .attach('file', TINY_PNG_BUFFER, { filename: 'initial_doc.png', contentType: 'image/png' });

        expect(upload1.status).toBe(200);
        const publicId1 = upload1.body.publicId;

        // Register with document 1
        await request(app)
          .post('/api/providers/register')
          .set('Cookie', providerCookieA)
          .send({
            name: 'Provider Alice',
            idProofPublicId: publicId1,
            idProofUrl: upload1.body.url,
            idProofResourceType: upload1.body.resourceType,
          });

        const diskPath1 = resolveLocalKycPath(publicId1, providerUserA._id);
        expect(fs.existsSync(diskPath1)).toBe(true);

        // Step 2: Provider A uploads replacement document 2
        const upload2 = await request(app)
          .post('/api/upload/private')
          .set('Cookie', providerCookieA)
          .field('docType', 'idProof')
          .attach('file', TINY_PNG_BUFFER, { filename: 'replacement_doc.png', contentType: 'image/png' });

        expect(upload2.status).toBe(200);
        const publicId2 = upload2.body.publicId;

        // Register with document 2 (triggers replacement cleanup of doc 1)
        await request(app)
          .post('/api/providers/register')
          .set('Cookie', providerCookieA)
          .send({
            name: 'Provider Alice',
            idProofPublicId: publicId2,
            idProofUrl: upload2.body.url,
            idProofResourceType: upload2.body.resourceType,
          });

        const diskPath2 = resolveLocalKycPath(publicId2, providerUserA._id);

        // Assert 1: Old document 1 was cleanly deleted
        expect(fs.existsSync(diskPath1)).toBe(false);

        // Assert 2: New document 2 exists
        expect(fs.existsSync(diskPath2)).toBe(true);

        // Assert 3: External sentinel file remains completely intact and untouched!
        expect(fs.existsSync(sentinelPath)).toBe(true);
        expect(fs.readFileSync(sentinelPath, 'utf8')).toBe('CRITICAL_SENTINEL_DATA_MUST_NOT_BE_DELETED');

        // Clean up doc 2
        if (fs.existsSync(diskPath2)) {
          fs.unlinkSync(diskPath2);
        }
      } finally {
        if (fs.existsSync(sentinelPath)) {
          fs.unlinkSync(sentinelPath);
        }
      }
    });

    it('deletePrivateDocument refuses to delete paths with invalid publicId or missing Upload record', async () => {
      const uploadsRoot = getUploadsPrivateRoot();
      const sentinelPath = path.join(uploadsRoot, 'sentinel_delete_check.txt');
      fs.writeFileSync(sentinelPath, 'SENTINEL_DELETE_CHECK');

      try {
        // Attempt deletion with traversal payload
        await deletePrivateDocument(`fixnear_kyc_private/${providerUserA._id}/../../sentinel_delete_check.txt`, 'raw', providerUserA._id);
        expect(fs.existsSync(sentinelPath)).toBe(true);

        // Attempt deletion without Upload record
        await deletePrivateDocument(`fixnear_kyc_private/${providerUserA._id}/untracked_file.png`, 'image', providerUserA._id);
        expect(fs.existsSync(sentinelPath)).toBe(true);
      } finally {
        if (fs.existsSync(sentinelPath)) {
          fs.unlinkSync(sentinelPath);
        }
      }
    });
  });

  describe('4. File Serving & Server File Protection', () => {
    it('document routes never serve arbitrary server files like .env or server.js', async () => {
      // Even if provider profile maliciously contains a traversal string
      await Provider.updateOne(
        { userId: providerUserA._id },
        { idProofPublicId: `fixnear_kyc_private/${providerUserA._id}/../../.env` }
      );

      const res = await request(app)
        .get('/api/providers/documents/idProof/file')
        .set('Cookie', providerCookieA);

      // Must be rejected with 400 or 404, never 200
      expect(res.status).toBe(400);
      expect(res.body.message).not.toContain('JWT_SECRET');
    });
  });

  describe('5. Role Authorization & RBAC', () => {
    it('customer role is rejected with 403 when trying to access provider private documents', async () => {
      const fileRes = await request(app)
        .get('/api/providers/documents/idProof/file')
        .set('Cookie', customerCookie);

      expect(fileRes.status).toBe(403);

      const signedUrlRes = await request(app)
        .get('/api/providers/documents/idProof')
        .set('Cookie', customerCookie);

      expect(signedUrlRes.status).toBe(403);
    });
  });

  describe('6. Cleanup Script (fixKycPaths)', () => {
    it('finds and sanitizes providers with invalid publicIds or missing Upload records', async () => {
      // Provider A has an invalid publicId
      providerDocA.idProofPublicId = `fixnear_kyc_private/${providerUserA._id}/../../.env`;
      providerDocA.status = 'take_skill_test';
      await providerDocA.save();

      // Provider B has a syntactically valid publicId but NO Upload record
      providerDocB.certificatePublicId = `fixnear_kyc_private/${providerUserB._id}/phantom_cert.pdf`;
      providerDocB.status = 'waiting_for_approval';
      await providerDocB.save();

      // Run fixKycPaths
      const summary = await fixKycPaths();

      expect(summary.totalInspected).toBe(2);
      expect(summary.fixedCount).toBe(2);

      // Re-fetch providers
      const updatedA = await Provider.findById(providerDocA._id);
      expect(updatedA.idProofPublicId).toBe('');
      expect(updatedA.status).toBe('needs_info');
      expect(updatedA.rejectionReason).toContain('re-upload');

      const updatedB = await Provider.findById(providerDocB._id);
      expect(updatedB.certificatePublicId).toBe('');
      expect(updatedB.status).toBe('needs_info');

      // Verify AuditLog entries were created
      const auditEntries = await AuditLog.find({ action: 'FIX_KYC_PATHS_CLEANUP' });
      expect(auditEntries.length).toBe(2);
      expect(auditEntries.some((e) => e.targetId === String(providerDocA._id))).toBe(true);
      expect(auditEntries.some((e) => e.targetId === String(providerDocB._id))).toBe(true);
    });
  });
});
