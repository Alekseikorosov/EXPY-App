const { ValidationError, UniqueConstraintError } = require('sequelize');

module.exports = function errorHandler(err, req, res, next) {
    if (err instanceof UniqueConstraintError) {
        const field = err.errors?.[0]?.path || 'value';
        return res.status(409).json({ error: `The ${field} is already taken` });
    }

    if (err instanceof ValidationError) {
        return res
            .status(400)
            .json({ error: err.errors.map(e => e.message).join(', ') });
    }

    console.error('Unhandled error:', err);
    return res.status(500).json({ error: 'Internal server error' });
};
