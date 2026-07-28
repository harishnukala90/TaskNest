/**
 * Validation utilities for form inputs
 */

/**
 * Validate password strength
 * @param {string} password - The password to validate
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: "Password is required" };
  }
  
  if (password.length < 8) {
    return { isValid: false, message: "Password must be at least 8 characters long" };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one uppercase letter" };
  }
  
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one lowercase letter" };
  }
  
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one number" };
  }
  
  return { isValid: true, message: "" };
};

/**
 * Get password strength score (0-4)
 * @param {string} password - The password to check
 * @returns {number} - Strength score (0: weak, 4: strong)
 */
export const getPasswordStrength = (password) => {
  if (!password) return 0;
  
  let score = 0;
  
  // Length checks
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  
  // Character type checks
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  return Math.min(score, 4);
};

/**
 * Get password strength label
 * @param {number} score - Strength score (0-4)
 * @returns {object} - { label: string, color: string }
 */
export const getPasswordStrengthLabel = (score) => {
  const strengthMap = {
    0: { label: "Very Weak", color: "#ef4444" },
    1: { label: "Weak", color: "#f97316" },
    2: { label: "Fair", color: "#eab308" },
    3: { label: "Good", color: "#22c55e" },
    4: { label: "Strong", color: "#10b981" },
  };
  
  return strengthMap[score] || strengthMap[0];
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate username format
 * @param {string} username - Username to validate
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validateUsername = (username) => {
  if (!username) {
    return { isValid: false, message: "Username is required" };
  }
  
  if (username.length < 3) {
    return { isValid: false, message: "Username must be at least 3 characters long" };
  }
  
  if (username.length > 20) {
    return { isValid: false, message: "Username must be at most 20 characters long" };
  }
  
  if (!/^[a-z0-9_]+$/.test(username)) {
    return { 
      isValid: false, 
      message: "Username can only contain lowercase letters, numbers, and underscores" 
    };
  }
  
  return { isValid: true, message: "" };
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validatePhone = (phone) => {
  if (!phone) {
    return { isValid: false, message: "Phone number is required" };
  }
  
  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (digitsOnly.length < 10) {
    return { isValid: false, message: "Phone number must be at least 10 digits" };
  }
  
  if (digitsOnly.length > 15) {
    return { isValid: false, message: "Phone number is too long" };
  }
  
  return { isValid: true, message: "" };
};

/**
 * Validate required field
 * @param {string} value - Value to check
 * @param {string} fieldName - Name of the field for error message
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validateRequired = (value, fieldName) => {
  if (!value || value.trim() === "") {
    return { isValid: false, message: `${fieldName} is required` };
  }
  return { isValid: true, message: "" };
};

/**
 * Sanitize input to prevent XSS
 * @param {string} input - Input to sanitize
 * @returns {string}
 */
export const sanitizeInput = (input) => {
  if (!input) return "";
  
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
};
