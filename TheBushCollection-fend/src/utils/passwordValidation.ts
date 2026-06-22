/**
 * Password Validation Utility
 * Enforces highly secure password standards
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'fair' | 'good' | 'strong';
  score: number;
}

// Common weak patterns and words to avoid
const COMMON_PATTERNS = [
  '123456', '654321', '111111', '000000', '121212', '123123',
  'abc123', 'password', 'qwerty', 'letmein', 'welcome',
  'admin', 'login', 'monkey', 'dragon', 'master', 'sunshine'
];

// Common dictionary words - expanded list
const COMMON_WORDS = [
  'password', 'pass', 'word', 'user', 'name', 'admin', 'login',
  'email', 'phone', 'date', 'year', 'month', 'day', 'time',
  'welcome', 'hello', 'goodbye', 'secret', 'private', 'access',
  'denied', 'denied', 'granted', 'allowed', 'blocked', 'warning',
  'error', 'success', 'failed', 'failed', 'complete', 'finished',
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
  'sunday', 'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'
];

/**
 * Validates password against high security standards
 * @param password - The password to validate
 * @returns PasswordValidationResult object with validation details
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  let score = 0;

  // Check minimum length
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  } else {
    score += 20;
  }

  // Check for uppercase letters
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must include at least one uppercase letter');
  } else {
    score += 15;
  }

  // Check for lowercase letters
  if (!/[a-z]/.test(password)) {
    errors.push('Password must include at least one lowercase letter');
  } else {
    score += 15;
  }

  // Check for numbers
  if (!/\d/.test(password)) {
    errors.push('Password must include at least one number');
  } else {
    score += 15;
  }

  // Check for special characters
  if (!/[!@#$%^&*()_+\-=[\]{};:'",.<>?/\\|`~]/.test(password)) {
    errors.push('Password must include at least one special character (!@#$%^&*()_+-=[]{};:\'",.<>?/\\|`~)');
  } else {
    score += 15;
  }

  // Check for common patterns
  const lowerPassword = password.toLowerCase();
  if (COMMON_PATTERNS.some(pattern => lowerPassword.includes(pattern))) {
    errors.push('Password contains common patterns (e.g., 123456, abc123). Avoid predictable sequences');
    score = Math.max(0, score - 20);
  }

  // Check for dictionary words
  if (COMMON_WORDS.some(word => lowerPassword.includes(word))) {
    errors.push('Password contains common dictionary words. Use unique combinations');
    score = Math.max(0, score - 15);
  }

  // Check for repeating characters (more than 3 in a row)
  if (/(.)\1{3,}/.test(password)) {
    errors.push('Avoid repeating characters (e.g., aaaa, 1111)');
    score = Math.max(0, score - 10);
  }

  // Check for sequential characters
  if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password)) {
    errors.push('Avoid sequential characters (e.g., abc, 123)');
    score = Math.max(0, score - 10);
  }

  // Bonus for length
  if (password.length >= 10) score += 10;
  if (password.length >= 14) score += 10;

  // Determine strength
  let strength: 'weak' | 'fair' | 'good' | 'strong';
  if (score >= 80) {
    strength = 'strong';
  } else if (score >= 60) {
    strength = 'good';
  } else if (score >= 40) {
    strength = 'fair';
  } else {
    strength = 'weak';
  }

  // Cap score at 100
  const finalScore = Math.min(score, 100);

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    score: finalScore
  };
}

/**
 * Gets a user-friendly error message for password validation
 * @param validationResult - Result from validatePassword()
 * @returns Formatted error message string
 */
export function getPasswordErrorMessage(validationResult: PasswordValidationResult): string {
  if (validationResult.isValid) {
    return 'Password is valid';
  }

  if (validationResult.errors.length === 1) {
    return validationResult.errors[0];
  }

  return `Password does not meet security requirements:\n${validationResult.errors.map((e, i) => `${i + 1}. ${e}`).join('\n')}`;
}

/**
 * Gets password strength indicator text
 * @param strength - Strength level from validation
 * @returns Display text for the strength
 */
export function getStrengthLabel(strength: string): string {
  switch (strength) {
    case 'strong':
      return 'Strong';
    case 'good':
      return 'Good';
    case 'fair':
      return 'Fair';
    case 'weak':
      return 'Weak';
    default:
      return 'Unknown';
  }
}

/**
 * Gets color for password strength indicator
 * @param strength - Strength level from validation
 * @returns Tailwind color class
 */
export function getStrengthColor(strength: string): string {
  switch (strength) {
    case 'strong':
      return 'bg-green-500/30 border-green-500/50 text-green-300';
    case 'good':
      return 'bg-blue-500/30 border-blue-500/50 text-blue-300';
    case 'fair':
      return 'bg-yellow-500/30 border-yellow-500/50 text-yellow-300';
    case 'weak':
      return 'bg-red-500/30 border-red-500/50 text-red-300';
    default:
      return 'bg-gray-500/30 border-gray-500/50 text-gray-300';
  }
}

/**
 * Gets progress bar color based on score
 * @param score - Password score (0-100)
 * @returns Tailwind color class
 */
export function getProgressBarColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-blue-500';
  if (score >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
}
