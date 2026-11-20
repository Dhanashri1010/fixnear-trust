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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mongod;
let providerUser, providerDoc;
let adminUser;
let customerUser;

let providerCookie, adminCookie, customerCookie;

// Real tiny PNG (1x1 transparent PNG)
const TINY_PNG_BUFFER = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

// Real tiny valid PDF
const TINY_PDF_BUFFER = Buffer.from(
  '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 3 3]>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000053 00000 n\n0000000102 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n149\n%%EOF\n',
  'utf-8'
);

beforeAll(async () => {
  mongod = await MongoMemoryServer.create({
    instance: {
      dbName: 'fixnear_test_docs',
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

  // 1. Create provider user & profile
  providerUser = await User.create({
    name: 'Rajesh Technician',
    email: 'rajesh.tech@example.com',
    phone: '9876543210',
    password: 'Password123!',
    role: 'provider',
    city: 'Mumbai',
  });

  providerDoc = await Provider.create({
    userId: providerUser._id,
    name: providerUser.name,
    email: providerUser.email,
    phone: providerUser.phone,
    city: 'Mumbai',
    specialty: 'Air Conditioner Repair',
    status: 'take_skill_test',
    skills: [
      {
        categoryId: 'ac-cooling',
        categoryName: 'Air Conditioner',
        passed: false,
        testScore: 0,
        badge: '',
        status: 'not_taken',
      },
    ],
  });

  // 2. Create admin user
  adminUser = await User.create({
    name: 'Admin Governance',
    email: 'admin.gov@example.com',
    phone: '9876543211',
    password: 'Password123!',
    role: 'admin',
    city: 'Mumbai',
  });

  // 3. Create customer user
  customerUser = await User.create({
    name: 'Amit Customer',
    email: 'amit.customer@example.com',
    phone: '9876543212',
    password: 'Password123!',
    role: 'customer',
    city: 'Mumbai',
  });

  // Generate auth cookies
  const provToken = jwt.sign({ id: providerUser._id, role: 'provider' }, process.env.JWT_SECRET);
  providerCookie = `token=${provToken}`;

  const adminToken = jwt.sign({ id: adminUser._id, role: 'admin' }, process.env.JWT_SECRET);
  adminCookie = `token=${adminToken}`;

  const custToken = jwt.sign({ id: customerUser._id, role: 'customer' }, process.env.JWT_SECRET);
  customerCookie = `token=${custToken}`;
});

describe('Private KYC Document Pipeline & Verification', () => {
  it('uploads real tiny PNG to /api/upload/private and downloads back as provider and admin', async () => {
    // 1. Provider uploads tiny PNG
    const uploadRes = await request(app)
      .post('/api/upload/private')
      .set('Cookie', providerCookie)
      .field('docType', 'idProof')
      .attach('file', TINY_PNG_BUFFER, { filename: 'national_id.png', contentType: 'image/png' });

    expect(uploadRes.status).toBe(200);
    expect(uploadRes.body.success).toBe(true);
    expect(uploadRes.body.contentType).toBe('image');
    expect(uploadRes.body.resourceType).toBe('image');
    expect(uploadRes.body.publicId).toBeDefined();

    // 2. Register/save provider profile with this document
    const saveRes = await request(app)
      .post('/api/providers/register')
      .set('Cookie', providerCookie)
      .send({
        name: 'Rajesh Technician',
        phone: '9876543210',
        city: 'Mumbai',
        serviceArea: 'Bandra, Andheri',
        selectedCategories: ['ac-cooling'],
        idProofUrl: uploadRes.body.url,
        idProofPublicId: uploadRes.body.publicId,
        idProofResourceType: uploadRes.body.resourceType,
      });

    expect(saveRes.status).toBe(200);
    expect(saveRes.body.provider.idProofPublicId).toBe(uploadRes.body.publicId);

    // 3. Provider downloads back through document route
    const provDownloadRes = await request(app)
      .get('/api/providers/documents/idProof/file')
      .set('Cookie', providerCookie);

    expect(provDownloadRes.status).toBe(200);
    expect(provDownloadRes.headers['content-type']).toContain('image/png');
    expect(provDownloadRes.body).toEqual(TINY_PNG_BUFFER);

    // 4. Admin downloads back using providerId query
    const adminDownloadRes = await request(app)
      .get(`/api/providers/documents/idProof/file?providerId=${providerDoc._id}`)
      .set('Cookie', adminCookie);

    expect(adminDownloadRes.status).toBe(200);
    expect(adminDownloadRes.headers['content-type']).toContain('image/png');
    expect(adminDownloadRes.body).toEqual(TINY_PNG_BUFFER);
  });

  it('uploads real tiny PDF to /api/upload/private and downloads back as provider and admin', async () => {
    // 1. Provider uploads tiny PDF
    const uploadRes = await request(app)
      .post('/api/upload/private')
      .set('Cookie', providerCookie)
      .field('docType', 'idProof')
      .attach('file', TINY_PDF_BUFFER, { filename: 'identity.pdf', contentType: 'application/pdf' });

    expect(uploadRes.status).toBe(200);
    expect(uploadRes.body.success).toBe(true);
    expect(uploadRes.body.contentType).toBe('pdf');
    expect(uploadRes.body.resourceType).toBe('raw');
    expect(uploadRes.body.publicId).toBeDefined();

    // 2. Save profile
    await request(app)
      .post('/api/providers/register')
      .set('Cookie', providerCookie)
      .send({
        name: 'Rajesh Technician',
        phone: '9876543210',
        city: 'Mumbai',
        serviceArea: 'Bandra',
        selectedCategories: ['ac-cooling'],
        idProofUrl: uploadRes.body.url,
        idProofPublicId: uploadRes.body.publicId,
        idProofResourceType: uploadRes.body.resourceType,
      });

    // 3. Provider downloads PDF back
    const provDownloadRes = await request(app)
      .get('/api/providers/documents/idProof/file')
      .set('Cookie', providerCookie);

    expect(provDownloadRes.status).toBe(200);
    expect(provDownloadRes.headers['content-type']).toContain('application/pdf');

    // 4. Admin downloads PDF back
    const adminDownloadRes = await request(app)
      .get(`/api/providers/documents/idProof/file?providerId=${providerDoc._id}`)
      .set('Cookie', adminCookie);

    expect(adminDownloadRes.status).toBe(200);
    expect(adminDownloadRes.headers['content-type']).toContain('application/pdf');
  });

  it('rejects customer from uploading private documents (403)', async () => {
    const res = await request(app)
      .post('/api/upload/private')
      .set('Cookie', customerCookie)
      .field('docType', 'idProof')
      .attach('file', TINY_PNG_BUFFER, { filename: 'id.png', contentType: 'image/png' });

    expect(res.status).toBe(403);
  });

  it('rejects customer from reading private documents (403)', async () => {
    const res = await request(app)
      .get(`/api/providers/documents/idProof/file?providerId=${providerDoc._id}`)
      .set('Cookie', customerCookie);

    expect(res.status).toBe(403);
  });

  it('rejects oversized files (> 5 MB) with 400 and FILE_TOO_LARGE', async () => {
    // 5.5 MB buffer
    const oversizedBuffer = Buffer.alloc(5.5 * 1024 * 1024, 0x41);

    const res = await request(app)
      .post('/api/upload/private')
      .set('Cookie', providerCookie)
      .field('docType', 'idProof')
      .attach('file', oversizedBuffer, { filename: 'huge_id.png', contentType: 'image/png' });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('FILE_TOO_LARGE');
    expect(res.body.message).toContain('5 MB');
  });

  it('rejects wrong-type files with 400 and FILE_TYPE_NOT_ALLOWED', async () => {
    const textBuffer = Buffer.from('Plain text note about document');

    const res = await request(app)
      .post('/api/upload/private')
      .set('Cookie', providerCookie)
      .field('docType', 'idProof')
      .attach('file', textBuffer, { filename: 'document.txt', contentType: 'text/plain' });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('FILE_TYPE_NOT_ALLOWED');
    expect(res.body.message).toContain('JPG, PNG, WebP or PDF');
  });

  it('rejects renaming a text file to .pdf with 400 and FILE_TYPE_NOT_ALLOWED', async () => {
    // Content is plain ASCII text, but claiming to be PDF
    const fakePdfBuffer = Buffer.from('Hello world! This is a plain text file masquerading as a PDF document.');

    const res = await request(app)
      .post('/api/upload/private')
      .set('Cookie', providerCookie)
      .field('docType', 'idProof')
      .attach('file', fakePdfBuffer, { filename: 'forged_document.pdf', contentType: 'application/pdf' });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('FILE_TYPE_NOT_ALLOWED');
  });

  it('deletes old private file when replaced in "Fix and send again"', async () => {
    // 1. Upload first doc
    const upload1 = await request(app)
      .post('/api/upload/private')
      .set('Cookie', providerCookie)
      .field('docType', 'idProof')
      .attach('file', TINY_PNG_BUFFER, { filename: 'id_v1.png', contentType: 'image/png' });

    expect(upload1.status).toBe(200);

    await request(app)
      .post('/api/providers/register')
      .set('Cookie', providerCookie)
      .send({
        name: 'Rajesh Technician',
        phone: '9876543210',
        city: 'Mumbai',
        serviceArea: 'Bandra',
        selectedCategories: ['ac-cooling'],
        idProofUrl: upload1.body.url,
        idProofPublicId: upload1.body.publicId,
        idProofResourceType: upload1.body.resourceType,
      });

    // Check old file exists locally
    const relativeOldPath = upload1.body.publicId.replace(/^fixnear_kyc_private\//, '');
    const oldDiskPath = path.resolve(__dirname, '../uploads-private', relativeOldPath);
    expect(fs.existsSync(oldDiskPath)).toBe(true);

    // 2. Upload replacement doc
    const upload2 = await request(app)
      .post('/api/upload/private')
      .set('Cookie', providerCookie)
      .field('docType', 'idProof')
      .attach('file', TINY_PDF_BUFFER, { filename: 'id_v2.pdf', contentType: 'application/pdf' });

    expect(upload2.status).toBe(200);

    // Save profile with new file
    await request(app)
      .post('/api/providers/register')
      .set('Cookie', providerCookie)
      .send({
        name: 'Rajesh Technician',
        phone: '9876543210',
        city: 'Mumbai',
        serviceArea: 'Bandra',
        selectedCategories: ['ac-cooling'],
        idProofUrl: upload2.body.url,
        idProofPublicId: upload2.body.publicId,
        idProofResourceType: upload2.body.resourceType,
      });

    // Verify old file was deleted
    expect(fs.existsSync(oldDiskPath)).toBe(false);

    // Verify new file exists
    const relativeNewPath = upload2.body.publicId.replace(/^fixnear_kyc_private\//, '');
    const newDiskPath = path.resolve(__dirname, '../uploads-private', relativeNewPath);
    expect(fs.existsSync(newDiskPath)).toBe(true);

    // Clean up
    if (fs.existsSync(newDiskPath)) {
      fs.unlinkSync(newDiskPath);
    }
  });
});
