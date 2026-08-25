const mockGetUser = vi.fn();

const supabase = require('../src/supabase');
const { requireAuth } = require('../src/middleware/auth.middleware');
const { UnauthorizedError } = require('../src/errors');

beforeEach(() => {
    vi.restoreAllMocks();
    mockGetUser.mockReset();
});

function mockReq(authorization) {
    return { headers: { authorization } };
}

function mockRes() {
    return {};
}

describe('requireAuth', () => {
    it('Extracts token and user from a valid Bearer header', async () => {
        const fakeUser = { id: 'uuid', email: 'test@test.com', created_at: '2024-01-01' };
        vi.spyOn(supabase, 'getClient').mockReturnValue({
            auth: { getUser: mockGetUser },
        });
        mockGetUser.mockResolvedValue({ data: { user: fakeUser }, error: null });

        const req = mockReq('Bearer my-token');
        const next = vi.fn();

        await requireAuth(req, mockRes(), next);

        expect(req.token).toBe('my-token');
        expect(req.user).toEqual(fakeUser);
        expect(next).toHaveBeenCalled();
    });

    it('Throws UnauthorizedError when header is missing', async () => {
        const req = mockReq(undefined);

        await expect(requireAuth(req, mockRes(), vi.fn())).rejects.toThrow(UnauthorizedError);
    });

    it('Throws UnauthorizedError when header is not Bearer', async () => {
        const req = mockReq('Token my-token');

        await expect(requireAuth(req, mockRes(), vi.fn())).rejects.toThrow(UnauthorizedError);
    });

    it('Throws UnauthorizedError when token is empty', async () => {
        const req = mockReq('Bearer   ');

        await expect(requireAuth(req, mockRes(), vi.fn())).rejects.toThrow(UnauthorizedError);
    });

    it('Throws UnauthorizedError when Supabase rejects the token', async () => {
        vi.spyOn(supabase, 'getClient').mockReturnValue({
            auth: { getUser: mockGetUser },
        });
        mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'token expired' } });

        const req = mockReq('Bearer bad-token');

        await expect(requireAuth(req, mockRes(), vi.fn())).rejects.toThrow(UnauthorizedError);
    });

    it('Throws "Invalid or expired token" on Supabase rejection', async () => {
        vi.spyOn(supabase, 'getClient').mockReturnValue({
            auth: { getUser: mockGetUser },
        });
        mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'token expired' } });

        const req = mockReq('Bearer bad-token');

        await expect(requireAuth(req, mockRes(), vi.fn())).rejects.toThrow('Invalid or expired token');
    });

    it('Throws "Access token required" when header is missing', async () => {
        const req = mockReq(undefined);

        await expect(requireAuth(req, mockRes(), vi.fn())).rejects.toThrow('Access token required');
    });
});
