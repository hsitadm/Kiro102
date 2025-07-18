const User = require('../src/models/User');
const { protect, authorize } = require('../src/middleware/auth');

describe('Authentication and Authorization System', () => {
  test('User model has required fields and methods', () => {
    // Check if User model exists
    expect(User).toBeDefined();
    
    // Check if User schema exists
    expect(User.schema).toBeDefined();
    
    // Check if User schema has required fields
    const userSchema = User.schema;
    expect(userSchema.path('username')).toBeDefined();
    expect(userSchema.path('email')).toBeDefined();
    expect(userSchema.path('password')).toBeDefined();
    expect(userSchema.path('role')).toBeDefined();
    
    // Check if User schema has role enum with required values
    const roleEnum = userSchema.path('role').options.enum;
    expect(roleEnum).toContain('ADMIN');
    expect(roleEnum).toContain('MANAGER');
    expect(roleEnum).toContain('COLLABORATOR');
    
    // Check if User schema has matchPassword method
    expect(User.schema.methods.matchPassword).toBeDefined();
  });
  
  test('Auth middleware functions exist', () => {
    expect(protect).toBeDefined();
    expect(authorize).toBeDefined();
    expect(typeof protect).toBe('function');
    expect(typeof authorize).toBe('function');
  });
});