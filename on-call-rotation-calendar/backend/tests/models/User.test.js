const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../../src/models/User');

// Mock the validation utility
jest.mock('../../src/utils/validation', () => ({
  isValidEmail: jest.fn().mockImplementation(email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }),
  validatePassword: jest.fn().mockImplementation(password => {
    if (!password || password.length < 8) {
      return {
        isValid: false,
        message: 'Password must be at least 8 characters long'
      };
    }
    
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    if (!hasUppercase || !hasLowercase || !hasNumber) {
      return {
        isValid: false,
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      };
    }
    
    return {
      isValid: true,
      message: 'Password is valid'
    };
  }),
  isValidTimeZone: jest.fn().mockReturnValue(true)
}));

// Mock mongoose to avoid actual database operations
jest.mock('mongoose', () => {
  const originalModule = jest.requireActual('mongoose');
  
  return {
    ...originalModule,
    Schema: originalModule.Schema,
    model: jest.fn().mockReturnValue({
      pre: jest.fn(),
      methods: {},
      statics: {}
    })
  };
});

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true)
}));

describe('User Model', () => {
  let userSchema;
  
  beforeAll(() => {
    // Get the schema from the User model
    userSchema = User.schema;
  });
  
  describe('Schema Definition', () => {
    it('should have required fields', () => {
      expect(userSchema.path('username')).toBeDefined();
      expect(userSchema.path('email')).toBeDefined();
      expect(userSchema.path('password')).toBeDefined();
      expect(userSchema.path('role')).toBeDefined();
      expect(userSchema.path('createdAt')).toBeDefined();
      expect(userSchema.path('updatedAt')).toBeDefined();
    });
    
    it('should have username field with correct properties', () => {
      const username = userSchema.path('username');
      expect(username.instance).toBe('String');
      expect(username.options.required[0]).toBe(true);
      expect(username.options.unique).toBe(true);
      expect(username.options.minlength[0]).toBe(3);
      expect(username.options.maxlength[0]).toBe(30);
    });
    
    it('should have email field with correct properties', () => {
      const email = userSchema.path('email');
      expect(email.instance).toBe('String');
      expect(email.options.required[0]).toBe(true);
      expect(email.options.unique).toBe(true);
      expect(email.options.lowercase).toBe(true);
    });
    
    it('should have password field with correct properties', () => {
      const password = userSchema.path('password');
      expect(password.instance).toBe('String');
      expect(password.options.required[0]).toBe(true);
      expect(password.options.minlength[0]).toBe(8);
      expect(password.options.select).toBe(false);
    });
    
    it('should have role field with correct properties', () => {
      const role = userSchema.path('role');
      expect(role.instance).toBe('String');
      expect(role.options.enum).toEqual(['ADMIN', 'MANAGER', 'COLLABORATOR']);
      expect(role.options.default).toBe('COLLABORATOR');
    });
  });
  
  describe('Pre-save Hook', () => {
    it('should hash password before saving', async () => {
      // Get the pre-save hook function
      const preSaveHooks = userSchema._hooks.pre('save');
      expect(preSaveHooks).toBeDefined();
      
      // Create a mock document
      const mockDoc = {
        isModified: jest.fn().mockReturnValue(true),
        password: 'Password123'
      };
      
      // Create a mock next function
      const mockNext = jest.fn();
      
      // Call the pre-save hook
      await preSaveHooks[0].call(mockDoc, mockNext);
      
      // Verify that the password was hashed
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith('Password123', 'salt');
      expect(mockDoc.password).toBe('hashedPassword');
      expect(mockNext).toHaveBeenCalled();
    });
    
    it('should skip password hashing if not modified', async () => {
      // Get the pre-save hook function
      const preSaveHooks = userSchema._hooks.pre('save');
      
      // Create a mock document
      const mockDoc = {
        isModified: jest.fn().mockReturnValue(false),
        password: 'Password123'
      };
      
      // Create a mock next function
      const mockNext = jest.fn();
      
      // Call the pre-save hook
      await preSaveHooks[0].call(mockDoc, mockNext);
      
      // Verify that the password was not hashed
      expect(bcrypt.genSalt).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockDoc.password).toBe('Password123');
      expect(mockNext).toHaveBeenCalled();
    });
  });
  
  describe('Methods', () => {
    it('should have matchPassword method', () => {
      // Define the method on the mock document
      const mockDoc = {
        password: 'hashedPassword'
      };
      
      // Add the method from the schema
      mockDoc.matchPassword = userSchema.methods.matchPassword;
      
      // Call the method
      mockDoc.matchPassword('Password123');
      
      // Verify that bcrypt.compare was called
      expect(bcrypt.compare).toHaveBeenCalledWith('Password123', 'hashedPassword');
    });
  });
});