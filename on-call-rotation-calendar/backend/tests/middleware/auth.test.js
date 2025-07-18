// Mock dependencies
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn()
}));

jest.mock('../../src/models/User', () => ({
  findById: jest.fn()
}));

const jwt = require('jsonwebtoken');
const { protect, authorize } = require('../../src/middleware/auth');
const User = require('../../src/models/User');

describe('Auth Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      headers: {},
      path: '/test'
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('protect middleware', () => {
    it('should return 401 if no token is provided', async () => {
      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: 'UNAUTHORIZED',
        message: 'Not authorized to access this route'
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', async () => {
      req.headers.authorization = 'Bearer invalidtoken';
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: 'UNAUTHORIZED',
        message: 'Invalid token'
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if user does not exist', async () => {
      req.headers.authorization = 'Bearer validtoken';
      jwt.verify.mockReturnValue({ id: 'user_id' });
      User.findById.mockResolvedValue(null);

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: 'UNAUTHORIZED',
        message: 'User not found'
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should add user to request object and call next if token is valid', async () => {
      const user = { _id: 'user_id', role: 'ADMIN' };
      req.headers.authorization = 'Bearer validtoken';
      jwt.verify.mockReturnValue({ id: 'user_id' });
      User.findById.mockResolvedValue(user);

      await protect(req, res, next);

      expect(req.user).toEqual(user);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('authorize middleware', () => {
    it('should return 401 if user is not in request object', () => {
      const authMiddleware = authorize('ADMIN');
      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: 'UNAUTHORIZED',
        message: 'Not authorized to access this route'
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if user role is not authorized', () => {
      const authMiddleware = authorize('ADMIN');
      req.user = { role: 'COLLABORATOR' };
      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: 'FORBIDDEN',
        message: 'User role COLLABORATOR is not authorized to access this route'
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next if user role is authorized', () => {
      const authMiddleware = authorize('ADMIN', 'MANAGER');
      req.user = { role: 'ADMIN' };
      authMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});