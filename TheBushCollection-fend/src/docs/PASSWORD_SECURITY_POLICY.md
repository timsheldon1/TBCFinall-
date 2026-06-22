# Password Security Policy

## Overview
The Bush Collection implements a comprehensive password security policy to protect user accounts from unauthorized access and ensure data integrity. This document outlines the password requirements and best practices for all users.

## Password Requirements

### Mandatory Requirements

1. **Minimum Length: 6+ Characters**
   - Passwords must be at least 6 characters long
   - Longer passwords (10+ characters) receive higher security scores
   - Passwords with 14+ characters are considered optimal

2. **Character Variety (All Required)**
   - At least one **uppercase letter** (A-Z)
   - At least one **lowercase letter** (a-z)
   - At least one **number** (0-9)
   - At least one **special character** from the set: `!@#$%^&*()_+-=[]{};\:',.<>?/\|` and backtick

   **Example of valid special characters:**
   - `!` `@` `#` `$` `%` `^` `&` `*` `(` `)` `_` `+` `-` `=` `[` `]` `{` `}` `;` `:` `'` `"` `,` `.` `<` `>` `?` `/` `\` `|` `` ` ``

### Security Restrictions

3. **Avoid Common Patterns**
   - No sequential numeric patterns: `123456`, `654321`, etc.
   - No sequential alphabetic patterns: `abc123`, `abcdef`, etc.
   - No repeating characters: Avoid `aaaa`, `1111`, `!!!!`, etc.
   - No common weak patterns: `111111`, `000000`, `121212`

4. **Avoid Dictionary Words and Common Terms**
   - Avoid common dictionary words: `password`, `welcome`, `login`, `admin`, `master`, etc.
   - Avoid common month/day names: `January`, `Monday`, etc.
   - Avoid predictable terms: `admin`, `user`, `login`, `access`, `denied`, etc.
   - Avoid words related to the service: `bush`, `collection`, `hotel`, `safari`, etc.

5. **Uniqueness and Randomness**
   - Each password must be unique and not easily guessable
   - Avoid passwords that can be derived from personal information (birth dates, names, etc.)
   - Avoid reusing old passwords

### Optional Enhancements

6. **Passphrase Style (Recommended)**
   - Use unrelated words separated by symbols for memorable yet strong passwords
   - **Examples:**
     - `Coffee#Mountain$2024` (words + symbols + numbers)
     - `Blue-Guitar!Phoenix99` (adjective-noun!noun+number)
     - `Ocean_Book*Castle7` (noun_noun*noun+number)

## Password Strength Scoring

The system evaluates password strength on a scale of 0-100:

| Score Range | Strength Level | Color | Notes |
|---|---|---|---|
| 80-100 | **Strong** | Green | Excellent security |
| 60-79 | **Good** | Blue | Solid security |
| 40-59 | **Fair** | Yellow | Acceptable but could be improved |
| 0-39 | **Weak** | Red | Does not meet requirements |

### Scoring Factors
- **Minimum length met**: +20 points
- **Uppercase letters**: +15 points
- **Lowercase letters**: +15 points
- **Numbers**: +15 points
- **Special characters**: +15 points
- **Extra length (10+ chars)**: +10 points
- **Extra length (14+ chars)**: +10 points
- **Common patterns detected**: -20 points (penalty)
- **Dictionary words detected**: -15 points (penalty)
- **Repeating characters**: -10 points (penalty)
- **Sequential characters**: -10 points (penalty)

## Real-World Examples

### ❌ INVALID PASSWORDS

| Password | Why It's Invalid |
|---|---|
| `password123` | Common word + predictable pattern |
| `123456` | Too short, sequential pattern |
| `abcdef` | Sequential characters, no numbers/special chars |
| `ABC123` | No special characters, no lowercase |
| `Test@123` | Too short (5 chars) |
| `Admin!2024` | Common word "Admin" |
| `Aaaa!1111` | Repeating characters |

### ✅ VALID PASSWORDS

| Password | Strength | Why It's Valid |
|---|---|---|
| `Bl@ck!Dog42` | Strong | 11 chars, mix of all types, no common patterns |
| `Mountain#River$99` | Strong | 17 chars, passphrase style, excellent complexity |
| `Pizza!Book*Land7` | Good | 15 chars, mixed case, numbers, special chars, unrelated words |
| `X8m#Qz!Pv` | Strong | Short but highly random with all character types |
| `Coffee&Jazz2024!` | Strong | Passphrase style, memorable but secure |

## Implementation Details

### Validation Logic
The password validation system in this application:

1. **Real-time Feedback**: Validates as the user types
2. **Character Checking**: Verifies presence of all required character types
3. **Pattern Detection**: Scans for common patterns and sequences
4. **Dictionary Matching**: Checks against a database of common words
5. **Strength Scoring**: Calculates overall security strength
6. **Error Messages**: Provides specific guidance on what needs improvement

### User Experience Features

- **Strength Indicator**: Visual progress bar showing password strength
- **Real-time Validation**: Users see errors as they type, before submission
- **Detailed Feedback**: Specific messages for each requirement not met
- **Password Visibility**: Toggle to show/hide password while typing
- **Submit Button**: Disabled until password meets all requirements
- **Requirements Display**: Shows all requirements upfront

## Best Practices for Users

1. **Be Unique**
   - Use different passwords for different accounts
   - Avoid reusing passwords from other services

2. **Stay Random**
   - Use password managers to generate strong passwords
   - Avoid patterns related to keyboard layout (qwerty, asdf, etc.)

3. **Keep It Secure**
   - Never share your password with anyone
   - Don't store passwords in plain text documents
   - Use a password manager for secure storage

4. **Update Regularly**
   - Change your password every 90 days
   - Immediately change if you suspect compromise

5. **Avoid Personal Information**
   - Don't include names, birthdates, or addresses
   - Don't use sequential dates or numbers

## Password Reset Process

When you need to reset your password:

1. Visit the "Forgot Password" page
2. Enter your email address
3. Check your email for the reset link
4. Follow the link and set your new password according to these requirements
5. Sign in with your new password

## Technical Security

### Backend Validation
- Passwords are validated on both client and server sides
- Server performs comprehensive validation checks
- Passwords are hashed using industry-standard algorithms (bcrypt)
- Password hashes are never logged or displayed

### Encryption & Storage
- Passwords are never stored in plain text
- All password-related communications use HTTPS encryption
- Reset tokens expire after 24 hours
- Multiple reset attempts trigger security checks

## Support & Questions

If you have questions about password requirements or encounter issues resetting your password:

1. Contact support@thebushcollection.com
2. Use the in-app help or FAQ section
3. Check the security guidelines on your account settings page

---

**Last Updated**: April 2026
**Version**: 1.0
**Effective Date**: Immediately upon implementation
