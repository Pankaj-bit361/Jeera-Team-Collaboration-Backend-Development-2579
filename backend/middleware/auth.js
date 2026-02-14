import jwt from 'jsonwebtoken';
import Organization from '../models/Organization.js';

export const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export const requireOrganization = async (req, res, next) => {
  const orgId = req.header('organizationId') || req.query.organizationId;

  if (!orgId) {
    return res.status(400).json({ message: 'Organization ID is required in headers (organizationId)' });
  }

  try {
    // Verify user belongs to this org
    const org = await Organization.findOne({
      _id: orgId,
      members: req.user.userId
    });

    if (!org) {
      return res.status(403).json({ message: 'Access denied. You are not a member of this organization.' });
    }

    req.organizationId = orgId;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error verifying organization access' });
  }
};