const mockAuth = {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
};

const supabase = require('../src/supabase');
const { signup, login, logout } = require('../src/services/auth.services');
const { ValidationError, UnauthorizedError } = require('../src/errors');

beforeEach(() => {
    vi.restoreAllMocks();
    mockAuth.signUp.mockReset();
    mockAuth.signInWithPassword.mockReset();
    mockAuth.signOut.mockReset();
});

describe('signup', () => {
    it('Creates a user and returns the user object', async () => {
        const fakeUser = { id: 'uuid-123', email: 'test@test.com' };
        vi.spyOn(supabase, 'getClient').mockReturnValue({
            auth: mockAuth,
        });
        mockAuth.signUp.mockResolvedValue({ data: { user: fakeUser }, error: null });

        const result = await signup({ email: 'test@test.com', password: 'pass123' });

        expect(mockAuth.signUp).toHaveBeenCalledWith({ email: 'test@test.com', password: 'pass123' });
        expect(result).toEqual(fakeUser);
    });

    it('Throws ValidationError when email is missing', async () => {
        await expect(signup({ password: 'pass123' })).rejects.toThrow(ValidationError);
    });

    it('Throws ValidationError when password is missing', async () => {
        await expect(signup({ email: 'test@test.com' })).rejects.toThrow(ValidationError);
    });

    it('Throws ValidationError when body is empty', async () => {
        await expect(signup({})).rejects.toThrow(ValidationError);
    });

    it('Throws ValidationError with Supabase error message on failure', async () => {
        vi.spyOn(supabase, 'getClient').mockReturnValue({
            auth: mockAuth,
        });
        mockAuth.signUp.mockResolvedValue({ data: null, error: { message: 'User already registered' } });

        await expect(signup({ email: 'test@test.com', password: 'pass123' })).rejects.toThrow(ValidationError);
    });

    it('Throws ValidationError with message "Bad Request" when fields missing', async () => {
        await expect(signup({})).rejects.toThrow('Bad Request');
    });
});

describe('login', () => {
    it('Returns access_token and refresh_token on success', async () => {
        const tokens = { access_token: 'jwt', refresh_token: 'refresh' };
        vi.spyOn(supabase, 'getClient').mockReturnValue({
            auth: mockAuth,
        });
        mockAuth.signInWithPassword.mockResolvedValue({
            data: { session: tokens },
            error: null,
        });

        const result = await login({ email: 'test@test.com', password: 'pass123' });

        expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({ email: 'test@test.com', password: 'pass123' });
        expect(result).toEqual(tokens);
    });

    it('Throws ValidationError when email is missing', async () => {
        await expect(login({ password: 'pass123' })).rejects.toThrow(ValidationError);
    });

    it('Throws ValidationError when password is missing', async () => {
        await expect(login({ email: 'test@test.com' })).rejects.toThrow(ValidationError);
    });

    it('Throws ValidationError when body is empty', async () => {
        await expect(login({})).rejects.toThrow(ValidationError);
    });

    it('Throws UnauthorizedError when Supabase rejects credentials', async () => {
        vi.spyOn(supabase, 'getClient').mockReturnValue({
            auth: mockAuth,
        });
        mockAuth.signInWithPassword.mockResolvedValue({
            data: null,
            error: { message: 'Invalid login credentials' },
        });

        await expect(login({ email: 'test@test.com', password: 'wrong' })).rejects.toThrow(UnauthorizedError);
        await expect(login({ email: 'test@test.com', password: 'wrong' })).rejects.toThrow('Invalid login credentials');
    });

    it('Throws ValidationError with message "Bad Request" when fields missing', async () => {
        await expect(login({})).rejects.toThrow('Bad Request');
    });
});

describe('logout', () => {
    it('Calls signOut and resolves successfully', async () => {
        vi.spyOn(supabase, 'getClient').mockReturnValue({
            auth: mockAuth,
        });
        mockAuth.signOut.mockResolvedValue({ error: null });

        await expect(logout()).resolves.toBeUndefined();
        expect(mockAuth.signOut).toHaveBeenCalled();
    });

    it('Throws UnauthorizedError when Supabase signOut fails', async () => {
        vi.spyOn(supabase, 'getClient').mockReturnValue({
            auth: mockAuth,
        });
        mockAuth.signOut.mockResolvedValue({ error: { message: 'Session not found' } });

        await expect(logout()).rejects.toThrow(UnauthorizedError);
    });
});
