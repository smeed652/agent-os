# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-08-09-user-authentication/spec.md

## Endpoints

### POST /api/auth/register

**Purpose:** Register a new user account
**Parameters:** 
- email: string (required, valid email format)
- password: string (required, meets security requirements)
**Response:** 
```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "user": {
    "id": 123,
    "email": "user@example.com",
    "email_verified": false
  }
}
```
**Errors:** 400 (validation errors), 409 (email already exists), 500 (server error)

### POST /api/auth/verify-email

**Purpose:** Verify user email address using token
**Parameters:**
- token: string (required, verification token from email)
**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```
**Errors:** 400 (invalid token), 410 (expired token), 500 (server error)

### POST /api/auth/login

**Purpose:** Authenticate user and create session
**Parameters:**
- email: string (required)  
- password: string (required)
**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 123,
    "email": "user@example.com",
    "email_verified": true
  },
  "token": "jwt_token_here"
}
```
**Errors:** 400 (validation errors), 401 (invalid credentials), 423 (account locked), 500 (server error)

### POST /api/auth/logout

**Purpose:** End user session and invalidate token
**Parameters:** None (uses session token)
**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```
**Errors:** 401 (not authenticated), 500 (server error)

### GET /api/auth/profile

**Purpose:** Get current user profile information
**Parameters:** None (uses session token)
**Response:**
```json
{
  "success": true,
  "user": {
    "id": 123,
    "email": "user@example.com",
    "email_verified": true,
    "created_at": "2025-08-09T10:30:00Z"
  }
}
```
**Errors:** 401 (not authenticated), 500 (server error)

### PUT /api/auth/profile

**Purpose:** Update user profile information
**Parameters:**
- email: string (optional, valid email format)
**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": 123,
    "email": "newemail@example.com",
    "email_verified": false
  }
}
```
**Errors:** 400 (validation errors), 401 (not authenticated), 409 (email already exists), 500 (server error)

### PUT /api/auth/change-password

**Purpose:** Change user password
**Parameters:**
- current_password: string (required)
- new_password: string (required, meets security requirements)
**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```
**Errors:** 400 (validation errors), 401 (not authenticated), 403 (invalid current password), 500 (server error)

## Controllers

### AuthController

**register(req, res)**
- Validates input parameters
- Checks if email already exists
- Hashes password using bcrypt
- Creates user record
- Generates email verification token
- Sends verification email
- Returns success response

**verifyEmail(req, res)**
- Validates verification token
- Checks token expiration
- Updates user email_verified status
- Removes used verification token
- Returns success response

**login(req, res)**
- Validates credentials
- Checks rate limiting
- Verifies password hash
- Creates JWT session token
- Sets secure session cookie
- Returns user data and token

**logout(req, res)**
- Invalidates current session token
- Clears session cookie
- Updates session table
- Returns success response

**getProfile(req, res)**
- Validates session token
- Retrieves current user data
- Returns user profile information

**updateProfile(req, res)**
- Validates session token
- Validates new profile data
- Updates user record
- Handles email change verification
- Returns updated user data

**changePassword(req, res)**
- Validates session token
- Verifies current password
- Validates new password requirements
- Updates password hash
- Invalidates other sessions
- Returns success response