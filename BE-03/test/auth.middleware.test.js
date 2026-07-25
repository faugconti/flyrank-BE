const { requireAuth } = require('../src/middleware/auth.middleware');
const { UnauthorizedError } = require('../src/errors');

function mockReq(authorization) {
    return { headers: { authorization } };
}

function mockRes() {
    return {};
}

describe('requireAuth', () => {
    it('Extracts token from a valid Bearer header', () => {
        const req = mockReq('Bearer my-token');
        const next = vi.fn();

        requireAuth(req, mockRes(), next);

        expect(req.token).toBe('my-token');
        expect(next).toHaveBeenCalled();
    });

    it('Throws UnauthorizedError when header is missing', () => {
        const req = mockReq(undefined);

        expect(() => requireAuth(req, mockRes(), vi.fn())).toThrow(UnauthorizedError);
    });

    it('Throws UnauthorizedError when header is not Bearer', () => {
        const req = mockReq('Token my-token');

        expect(() => requireAuth(req, mockRes(), vi.fn())).toThrow(UnauthorizedError);
    });

    it('Throws UnauthorizedError when token is empty', () => {
        const req = mockReq('Bearer   ');

        expect(() => requireAuth(req, mockRes(), vi.fn())).toThrow(UnauthorizedError);
    });
});
