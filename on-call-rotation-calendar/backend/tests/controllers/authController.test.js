// Mock dependencies
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn()
}));

jest.mock('../../src/models/User', () => ({
  findOne: jest.fn(),
  findById: jest.fn(),
  create: jest.fn()
}));

const jwt = require('jsonwebtoken');
const { register, login, getMe, updatePassword } = require('../../src/controllers/authController');
const User = require('../../src/models/User');

describe('Auth Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      body: {},
      path: '/test',
      user: { id: 'user_id' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jwt.sign.mockReturnValue('test_token');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should return 400 if user already exists', async () => {
      req.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123'
      };
      User.findOne.mockResolvedValue({ _id: 'existing_user_id' });

      await register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: 'BAD_REQUEST',
        message: 'User already exists'
      }));
    });

    it('should create a new user and return token', async () => {
      const newUser = {
        _id: 'new_user_id',
        username: 'testuser',
        email: 'test@example.com',
        role: 'COLLABORATOR'
      };
      req.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123'
      };
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(newUser);

      await register(req, res, next);

      expect(User.create).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
        role: 'COLLABORATOR'
      });
      expect(jwt.sign).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: 'CREATED',
        message: 'User registered successfully',
        data: expect.objectContaining({
          user: newUser,
          token: 'test_token'
        })
      }));
    });

    it('should handle errors', async () => {
      const error = new Error('Test error');
      User.findOne.mockRejectedValue(error);

      await register(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('login', () => {
    it('should return 400 if email or password is missing', async () => {
      req.body = { email: 'test@example.com' }; // Missing password

      await login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: 'BAD_REQUEST',
        message: 'Please provide email and password'
      }));
    });

    it('should return 401 if user does not exist', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'Password123'
      };
      User.findOne.mockResolvedValue(null);

      await login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: 'UNAUTHORIZED',
        message: 'Invalid credentials'
      }));
    });

    it('should return 401 if password is incorrect', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'Password123'
      };
      const mockUser = {
        _id: 'user_id',
        email: 'test@example.com',
        matchPassword: jest.fn().mockResolvedValue(false)
      };
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await login(req, res, next);

      expect(mockUser.matchPassword).toHaveBeenCalledWith('Password123');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: 'UNAUTHORIZED',
        message: 'Invalid credentials'
      }));
    });

    it('should return user and token if credentials are valid', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'Password123'
      };
      const mockUser = {
        _id: 'user_id',
        email: 'test@example.com',
        role: 'COLLABORATOR',
        matchPassword: jest.fn().mockResolvedValue(true)
      };
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await login(req, res, next);

      expect(mockUser.matchPassword).toHaveBeenCalledWith('Password123');
      expect(jwt.sign).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: 'SUCCESS',
        message: 'Login successful',
        data: expect.objectContaining({
          user: expect.objectContaining({
            _id: 'user_id',
            email: 'test@example.com',
            role: 'COLLABORATOR'
          }),
          token: 'test_token'
        })
      }));
    });
  });

  describe('getMe', () => {
    it('should return the current user', async () => {
      await getMe(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: 'SUCCESS',
        message: 'User retrieved successfully',
        data: req.user
      }));
    });

    it('should handle errors', async () => {
      const error = new Error('Test error');
      res.status.mockImplementation(() => {
        throw error;
      });

      await getMe(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updatePassword', () => {
    it('should return 400 if current password or new password is missing', async () => {
      req.body = { currentPassword: 'OldPassword123' }; // Missing new password

      await updatePassword(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: 'BAD_REQUEST',
        message: 'Please provide current password and new password'
      }));
    });

    it('should return 401 if current password is incorrect', async () => {
      req.body = {
        currentPassword: 'OldPassword123',
        newPassword: 'NewPassword123'
      };
      const mockUser = {
        _id: 'user_id',
        matchPassword: jest.fn().mockResolvedValue(false)
      };
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await updatePassword(req, res, next);

      expect(mockUser.matchPassword).toHaveBeenCalledWith('OldPassword123');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: 'UNAUTHORIZED',
        message: 'Current password is incorrect'
      }));
    });

    it('should update password and return new token if current password is correct', async () => {
      req.body = {
        currentPassword: 'OldPassword123',
        newPassword: 'NewPassword123'
      };
      const mockUser = {
        _id: 'user_id',
        matchPassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true)
      };
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await updatePassword(req, res, next);

      expect(mockUser.matchPassword).toHaveBeenCalledWith('OldPassword123');
      expect(mockUser.password).toBe('NewPassword123');
      expect(mockUser.save).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: 'SUCCESS',
        message: 'Password updated successfully',
        data: expect.objectContaining({
          token: 'test_token'
        })
      }));
    });
  });
});