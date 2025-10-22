const AuthService = require('../services/Auth.service');

class AuthController {
  // Register user
  async register(req, res, next) {
    try {
      const result = await AuthService.register(req.body);

      res.status(201).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Login user
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);

      // Set token in cookie
      // Choose cookie settings depending on environment.
      // In production we need SameSite=None and secure to allow cross-site cookies over HTTPS.
      // In development (local http://localhost) use SameSite='Lax' and secure=false so browsers accept the cookie.
      const isProd = process.env.NODE_ENV === 'production';
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: isProd, // only send secure flag in production (HTTPS)
        sameSite: isProd ? 'None' : 'Lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Verify email
  async verifyEmail(req, res, next) {
    try {
      const { token } = req.query;
      const result = await AuthService.verifyEmail(token);

      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Resend verification email
  async resendVerificationEmail(req, res, next) {
    try {
      const { email } = req.body;
      const result = await AuthService.resendVerificationEmail(email);

      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Forgot password
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const result = await AuthService.forgotPassword(email);

      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Reset password
  async resetPassword(req, res, next) {
    try {
      const { token } = req.query;
      const { password } = req.body;
      const result = await AuthService.resetPassword(token, password);

      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Get current user
  async getCurrentUser(req, res, next) {
    try {
      res.status(200).json({
        status: 'success',
        data: { user: req.user }
      });
    } catch (error) {
      next(error);
    }
  }

  // Logout
  async logout(req, res, next) {
    try {
      // Clear cookie with same options to ensure it's removed in browsers
      const isProd = process.env.NODE_ENV === 'production';
      res.cookie('token', '', {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'None' : 'Lax',
        expires: new Date(0)
      });

      res.status(200).json({
        status: 'success',
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Refresh token
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const result = await AuthService.refreshToken(refreshToken);

      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
