export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!parsed.success) {
      const errorMsg = parsed.error.issues
        .map(issue => issue.message)
        .join('. ');

      const isWeak = parsed.error.issues.some(
        i => (Array.isArray(i.path) && i.path.some(p => String(p).toLowerCase().includes('password'))) ||
             i.message.toLowerCase().includes('password')
      );
      const code = isWeak ? 'PASSWORD_TOO_WEAK' : 'VALIDATION_ERROR';

      return res.status(400).json({
        success: false,
        code,
        message: errorMsg || 'Invalid request payload',
        errors: parsed.error.issues,
      });
    }

    // Assign sanitized data
    if (parsed.data.body) req.body = parsed.data.body;
    if (parsed.data.query) req.query = parsed.data.query;
    if (parsed.data.params) req.params = parsed.data.params;

    next();
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: 'Validation error: ' + err.message,
    });
  }
};
