const mongoose = require('mongoose');
const Collaborator = require('../../src/models/Collaborator');

// Mock the validation utility
jest.mock('../../src/utils/validation', () => ({
  isValidEmail: jest.fn().mockReturnValue(true),
  validatePassword: jest.fn().mockReturnValue({ isValid: true, message: 'Password is valid' }),
  isValidTimeZone: jest.fn().mockReturnValue(true)
}));

// Mock mongoose to avoid actual database operations
jest.mock('mongoose', () => {
  const originalModule = jest.requireActual('mongoose');
  
  return {
    ...originalModule,
    Schema: originalModule.Schema,
    model: jest.fn().mockImplementation((modelName) => {
      if (modelName === 'Availability') {
        return {
          findOne: jest.fn().mockResolvedValue(null)
        };
      }
      return {
        schema: new originalModule.Schema({})
      };
    })
  };
});

describe('Collaborator Model', () => {
  let collaboratorSchema;
  
  beforeAll(() => {
    // Get the schema from the Collaborator model
    collaboratorSchema = Collaborator.schema;
  });
  
  describe('Schema Definition', () => {
    it('should have required fields', () => {
      expect(collaboratorSchema.path('userId')).toBeDefined();
      expect(collaboratorSchema.path('firstName')).toBeDefined();
      expect(collaboratorSchema.path('lastName')).toBeDefined();
      expect(collaboratorSchema.path('timeZone')).toBeDefined();
      expect(collaboratorSchema.path('location')).toBeDefined();
      expect(collaboratorSchema.path('birthDate')).toBeDefined();
      expect(collaboratorSchema.path('adjustedBirthDate')).toBeDefined();
      expect(collaboratorSchema.path('maxHoursPerMonth')).toBeDefined();
      expect(collaboratorSchema.path('createdAt')).toBeDefined();
      expect(collaboratorSchema.path('updatedAt')).toBeDefined();
    });
    
    it('should have userId field with correct properties', () => {
      const userId = collaboratorSchema.path('userId');
      expect(userId.instance).toBe('ObjectID');
      expect(userId.options.ref).toBe('User');
      expect(userId.options.required[0]).toBe(true);
    });
    
    it('should have firstName field with correct properties', () => {
      const firstName = collaboratorSchema.path('firstName');
      expect(firstName.instance).toBe('String');
      expect(firstName.options.required[0]).toBe(true);
      expect(firstName.options.minlength[0]).toBe(2);
      expect(firstName.options.maxlength[0]).toBe(50);
    });
    
    it('should have lastName field with correct properties', () => {
      const lastName = collaboratorSchema.path('lastName');
      expect(lastName.instance).toBe('String');
      expect(lastName.options.required[0]).toBe(true);
      expect(lastName.options.minlength[0]).toBe(2);
      expect(lastName.options.maxlength[0]).toBe(50);
    });
    
    it('should have timeZone field with correct properties', () => {
      const timeZone = collaboratorSchema.path('timeZone');
      expect(timeZone.instance).toBe('String');
      expect(timeZone.options.required[0]).toBe(true);
    });
    
    it('should have location field with correct properties', () => {
      const location = collaboratorSchema.path('location');
      expect(location.instance).toBe('String');
      expect(location.options.required[0]).toBe(true);
      expect(location.options.enum).toEqual(['Americas', 'Europe', 'Asia', 'Africa', 'Oceania']);
      expect(location.options.default).toBe('Americas');
    });
    
    it('should have birthDate field with correct properties', () => {
      const birthDate = collaboratorSchema.path('birthDate');
      expect(birthDate.instance).toBe('Date');
      expect(birthDate.options.required[0]).toBe(true);
    });
    
    it('should have maxHoursPerMonth field with correct properties', () => {
      const maxHoursPerMonth = collaboratorSchema.path('maxHoursPerMonth');
      expect(maxHoursPerMonth.instance).toBe('Number');
      expect(maxHoursPerMonth.options.default).toBe(160);
      expect(maxHoursPerMonth.options.min[0]).toBe(0);
      expect(maxHoursPerMonth.options.max[0]).toBe(200);
    });
  });
  
  describe('Virtual Properties', () => {
    it('should have fullName virtual property', () => {
      // Create a mock document
      const mockDoc = {
        firstName: 'John',
        lastName: 'Doe'
      };
      
      // Add the virtual getter
      Object.defineProperty(mockDoc, 'fullName', {
        get: collaboratorSchema.virtuals.fullName.get
      });
      
      // Test the virtual property
      expect(mockDoc.fullName).toBe('John Doe');
    });
  });
  
  describe('Methods', () => {
    it('should have isAvailableOn method', async () => {
      // Define the method on the mock document
      const mockDoc = {
        _id: 'collaboratorId'
      };
      
      // Add the method from the schema
      mockDoc.isAvailableOn = collaboratorSchema.methods.isAvailableOn;
      
      // Call the method
      const result = await mockDoc.isAvailableOn(new Date());
      
      // Verify the result
      expect(result).toBe(true);
    });
    
    it('should have isBirthday method', () => {
      // Define the method on the mock document
      const birthDate = new Date(1990, 5, 15); // June 15, 1990
      const mockDoc = {
        birthDate,
        adjustedBirthDate: null
      };
      
      // Add the method from the schema
      mockDoc.isBirthday = collaboratorSchema.methods.isBirthday;
      
      // Test with matching date
      const matchingDate = new Date(2023, 5, 15); // June 15, 2023
      expect(mockDoc.isBirthday(matchingDate)).toBe(true);
      
      // Test with non-matching date
      const nonMatchingDate = new Date(2023, 5, 16); // June 16, 2023
      expect(mockDoc.isBirthday(nonMatchingDate)).toBe(false);
      
      // Test with adjusted birth date
      mockDoc.adjustedBirthDate = new Date(1990, 6, 15); // July 15, 1990
      const adjustedMatchingDate = new Date(2023, 6, 15); // July 15, 2023
      expect(mockDoc.isBirthday(adjustedMatchingDate)).toBe(true);
    });
  });
});