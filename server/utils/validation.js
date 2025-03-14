/**
 * Input validation utilities
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email is valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && emailRegex.test(email);
};

/**
 * Validate password strength
 * Requires at least 6 characters
 * @param {string} password - Password to validate
 * @returns {boolean} - Whether password is valid
 */
const isValidPassword = (password) => {
  return typeof password === 'string' && password.length >= 6;
};

/**
 * Validate username
 * Allows alphanumeric characters, underscore and dash
 * @param {string} username - Username to validate
 * @returns {boolean} - Whether username is valid
 */
const isValidUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
  return typeof username === 'string' && usernameRegex.test(username);
};

/**
 * Validate session code format
 * Should be exactly 8 characters, alphanumeric
 * @param {string} code - Session code to validate
 * @returns {boolean} - Whether code is valid
 */
const isValidSessionCode = (code) => {
  const codeRegex = /^[A-Z0-9]{8}$/;
  return typeof code === 'string' && codeRegex.test(code);
};

/**
 * Validate time format (HH:MM)
 * @param {string} time - Time string to validate
 * @returns {boolean} - Whether time string is valid
 */
const isValidTimeFormat = (time) => {
  const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
  return typeof time === 'string' && timeRegex.test(time);
};

/**
 * Validate day of week (0-6)
 * @param {number} day - Day number
 * @returns {boolean} - Whether day is valid
 */
const isValidDayOfWeek = (day) => {
  return Number.isInteger(day) && day >= 0 && day <= 6;
};

/**
 * Validate time range (end time is after start time)
 * @param {string} startTime - Start time (HH:MM)
 * @param {string} endTime - End time (HH:MM)
 * @returns {boolean} - Whether time range is valid
 */
const isValidTimeRange = (startTime, endTime) => {
  if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
    return false;
  }
  
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  if (endHour > startHour) {
    return true;
  } else if (endHour === startHour) {
    return endMinute > startMinute;
  }
  
  return false;
};

/**
 * Validate role (must be admin or user)
 * @param {string} role - Role to validate
 * @returns {boolean} - Whether role is valid
 */
const isValidRole = (role) => {
  return role === 'admin' || role === 'user';
};

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidUsername,
  isValidSessionCode,
  isValidTimeFormat,
  isValidDayOfWeek,
  isValidTimeRange,
  isValidRole
};
