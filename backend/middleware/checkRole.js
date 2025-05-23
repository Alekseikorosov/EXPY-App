// middleware/checkRole.js
module.exports = function checkRole(allowedRoles) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Authorization required' })
      }
      const role = req.user.role
      const ok = Array.isArray(allowedRoles)
        ? allowedRoles.includes(role)
        : role === allowedRoles
      if (!ok) {
        return res.status(403).json({ error: 'No access rights' })
      }
      next()
    }
  }
  