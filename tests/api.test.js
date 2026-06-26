const axios = require('axios');

const BASE = 'http://localhost:4000/api/v1';
const api = axios.create({ baseURL: BASE, timeout: 15000 });

jest.setTimeout(30000);

async function loginAs(email, password) {
  const step1 = await api.post('/auth/login', { email, password });
  const { tempToken, devOtp } = step1.data.data;
  const step2 = await api.post('/auth/verify-otp', { tempToken, otp: devOtp });
  const { accessToken, refreshToken, user } = step2.data.data;
  return { accessToken, refreshToken, user };
}

let adminToken = null;
let studentToken = null;
let adminUser = null;
let studentUser = null;

beforeAll(async () => {
  const a = await loginAs('admin@ta3lem.local', 'Admin@12345');
  adminToken = a.accessToken;
  adminUser = a.user;

  const s = await loginAs('student@test.local', 'Passw0rd!');
  studentToken = s.accessToken;
  studentUser = s.user;
});

describe('Health Check', () => {
  it('GET /health returns 200', async () => {
    const res = await axios.get('http://localhost:4000/health');
    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
  });
});

describe('Auth', () => {
  it('login with valid admin', async () => {
    expect(adminToken).toBeDefined();
    expect(adminToken.length).toBeGreaterThan(10);
    expect(adminUser.email).toBe('admin@ta3lem.local');
  });

  it('login with invalid password fails', async () => {
    try {
      await api.post('/auth/login', { email: 'admin@ta3lem.local', password: 'wrong' });
      fail('should have thrown');
    } catch (ex) {
      expect(ex.response.status).toBe(401);
    }
  });

  it('register with duplicate email fails', async () => {
    try {
      await api.post('/auth/register', {
        name: 'اختبار مستخدم تجريبي',
        email: 'admin@ta3lem.local',
        password: 'TestPass123',
        phone: '01234567890',
        guardian_name: 'ول أمر',
        guardian_phone: '01234567891',
      });
      fail('should have thrown');
    } catch (ex) {
      expect(ex.response.status).toBe(409);
    }
  });

  it('me without token returns 401', async () => {
    try {
      await api.get('/auth/me');
      fail('should have thrown');
    } catch (ex) {
      expect(ex.response.status).toBe(401);
    }
  });

  it('me with token returns user', async () => {
    const res = await api.get('/auth/me', { headers: { Authorization: `Bearer ${adminToken}` } });
    expect(res.status).toBe(200);
    expect(res.data.data.email).toBe('admin@ta3lem.local');
  });
});

describe('Wallet', () => {
  it('get wallet balance', async () => {
    const res = await api.get('/wallet', { headers: { Authorization: `Bearer ${studentToken}` } });
    expect(res.status).toBe(200);
    expect(res.data.data.currency).toBe('EGP');
  });

  it('get transaction history', async () => {
    const res = await api.get('/wallet/history', { headers: { Authorization: `Bearer ${studentToken}` } });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data.data)).toBe(true);
  });
});

describe('Sessions', () => {
  it('list sessions', async () => {
    const res = await api.get('/sessions', { headers: { Authorization: `Bearer ${adminToken}` } });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data.data)).toBe(true);
  });
});

describe('Subjects', () => {
  it('list subjects', async () => {
    const res = await api.get('/subjects', { headers: { Authorization: `Bearer ${adminToken}` } });
    expect(res.status).toBe(200);
    expect(res.data.data.length).toBeGreaterThan(0);
  });
});

describe('Reports', () => {
  it('platform stats', async () => {
    const res = await api.get('/reports/platform', { headers: { Authorization: `Bearer ${adminToken}` } });
    expect(res.status).toBe(200);
    expect(res.data.data.users).toBeGreaterThan(0);
  });
});

describe('RBAC', () => {
  it('student cannot access admin users', async () => {
    try {
      await api.get('/users', { headers: { Authorization: `Bearer ${studentToken}` } });
      fail('should have thrown');
    } catch (ex) {
      expect(ex.response.status).toBe(403);
    }
  });

  it('admin can access admin users', async () => {
    const res = await api.get('/users', { headers: { Authorization: `Bearer ${adminToken}` } });
    expect(res.status).toBe(200);
  });
});
