import { Router } from 'express';
import { db } from '../data/store.js';
import { generateJwtToken, requireAuth, parseJwtPayload } from '../middleware/authMiddleware.js';
import { createAndSendOtp, verifyOtp } from '../services/brevoService.js';

const router = Router();

/**
 * POST /api/auth/send-otp
 * Generates and sends a 6-digit verification OTP to the user's email via Brevo
 */
router.post('/send-otp', async (req, res) => {
  try {
    const { email, name } = req.body || {};

    if (!email || !email.includes('@')) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'A valid email address is required to receive the OTP.',
      });
    }

    const result = await createAndSendOtp(email, name);

    if (!result.success) {
      return res.status(result.rateLimited ? 429 : 500).json({
        code: result.rateLimited ? 'RATE_LIMITED' : 'SEND_OTP_FAILED',
        message: result.message,
      });
    }

    res.json({
      success: true,
      message: result.message,
      sentViaBrevo: result.sentViaBrevo,
      devOtp: result.devOtp, // Available in dev mode if Brevo key is not configured
    });
  } catch (err) {
    console.error('Error in /api/auth/send-otp:', err);
    res.status(500).json({
      code: 'SERVER_ERROR',
      message: 'Failed to dispatch verification OTP. Please try again.',
      details: err.message,
    });
  }
});

/**
 * POST /api/auth/check-email
 * Checks if an email is already registered and if they have a password set
 */
router.post('/check-email', (req, res) => {
  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Email is required' });
  }

  const user = db.findUserByEmail(email);
  res.json({
    exists: Boolean(user),
    hasPassword: Boolean(user?.hasPassword),
    name: user?.name || null,
  });
});

/**
 * POST /api/auth/verify-otp
 * Verifies the 6-digit OTP.
 * If user has no password yet, flags requiresPasswordSetup: true so they can set it.
 */
router.post('/verify-otp', (req, res) => {
  try {
    const { email, otp, name } = req.body || {};

    if (!email || !otp) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Both email and OTP code are required.',
      });
    }

    const verification = verifyOtp(email, otp);

    if (!verification.valid) {
      return res.status(400).json({
        code: 'INVALID_OTP',
        message: verification.message,
      });
    }

    // Find or automatically create citizen account
    let user = db.findUserByEmail(email);
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      const namePart = (name || email.split('@')[0]).replace(/[._-]/g, ' ');
      const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      user = db.createUser({
        email,
        name: formattedName || 'Citizen User',
        role: 'citizen',
        password: '',
        hasPassword: false,
      });
    }

    // Issue signed JWT
    const token = generateJwtToken(user);
    const requiresPasswordSetup = !user.hasPassword;

    res.json({
      success: true,
      message: 'Email successfully verified!',
      requiresPasswordSetup,
      isNewUser,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        hasPassword: Boolean(user.hasPassword),
        emailVerified: true,
      },
    });
  } catch (err) {
    console.error('Error in /api/auth/verify-otp:', err);
    res.status(500).json({
      code: 'SERVER_ERROR',
      message: 'Failed to verify OTP code.',
      details: err.message,
    });
  }
});

/**
 * POST /api/auth/set-password
 * Sets or updates the user's password after OTP verification so they can log in via password next time
 */
router.post('/set-password', (req, res) => {
  try {
    const { password, email: bodyEmail } = req.body || {};
    
    // Determine user email either from JWT token or fallback body email
    let userEmail = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = parseJwtPayload(token);
      if (decoded?.email) {
        userEmail = decoded.email;
      }
    }

    if (!userEmail && bodyEmail) {
      userEmail = bodyEmail;
    }

    if (!userEmail) {
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Authentication session expired. Please verify your email again.',
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Password must be at least 6 characters long.',
      });
    }

    const updatedUser = db.updateUserPassword(userEmail, password);
    if (!updatedUser) {
      return res.status(404).json({
        code: 'USER_NOT_FOUND',
        message: 'User account not found. Please verify your email first.',
      });
    }

    console.log(`[Auth] 🔑 Password created for user: ${userEmail}`);

    res.json({
      success: true,
      message: 'Password created successfully! You can now sign in using your email and password.',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        hasPassword: true,
        emailVerified: true,
      },
    });
  } catch (err) {
    console.error('Error in /api/auth/set-password:', err);
    res.status(500).json({
      code: 'SERVER_ERROR',
      message: 'Failed to set account password.',
      details: err.message,
    });
  }
});

/**
 * POST /api/auth/login
 * Standard email & password sign-in for users who have created their password
 */
router.post('/login', (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Both email and password are required.',
    });
  }

  const user = db.findUserByEmail(email);

  if (!user) {
    return res.status(404).json({
      code: 'USER_NOT_FOUND',
      message: 'No account found with this email. Please verify with OTP to create your account.',
    });
  }

  if (!user.hasPassword) {
    return res.status(400).json({
      code: 'PASSWORD_NOT_SET',
      message: 'You have not created a password yet. Please sign in via Email OTP to set your password.',
    });
  }

  // Verify password (plain comparison or hash)
  if (user.password !== password) {
    return res.status(401).json({
      code: 'INVALID_CREDENTIALS',
      message: 'Incorrect password. Please try again or sign in with Email OTP.',
    });
  }

  const token = generateJwtToken(user);

  res.json({
    success: true,
    message: 'Signed in successfully!',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      hasPassword: true,
      emailVerified: true,
    },
  });
});

/**
 * GET /api/auth/me
 */
router.get('/me', requireAuth, (req, res) => {
  const user = db.findUserByEmail(req.user.email);
  res.json({
    user: user
      ? {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          hasPassword: Boolean(user.hasPassword),
          emailVerified: true,
        }
      : req.user,
  });
});

export default router;

