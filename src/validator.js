// Custom module: all validation is performed on the server.
function validateRegistration(input) {
  const errors = {};
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { valid: false, errors: { body: 'Request body must be a JSON object' } };
  }
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const email = typeof input.email === 'string' ? input.email.trim() : '';
  const age = Number(input.age);

  if (name.length < 2 || name.length > 60) errors.name = 'Name must contain 2 to 60 characters';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address';
  if (input.age === '' || input.age === undefined || !Number.isInteger(age) || age < 18 || age > 100) {
    errors.age = 'Age must be an integer from 18 to 100';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}
module.exports = { validateRegistration };
