/**
 * Public Provider Serializer
 * -----------------------------------------------------------
 * Converts a Provider document to a plain object that is SAFE
 * to return in public-facing API responses (listings, search,
 * technician profile page, booking confirmation).
 *
 * Fields that MUST NEVER appear in public responses:
 *   • email, phone
 *   • idProofUrl, idProofPublicId, idProofResourceType
 *   • certificateUrl, certificatePublicId, certificateResourceType
 *   • adminNotes, rejectionReason
 *   • userId (internal reference — only exposed where needed)
 *
 * @param {Object} provider  Mongoose Provider document or plain object
 * @param {Object} [opts]    Options
 * @param {boolean} [opts.includeUserId=false]  Expose userId (booking reference)
 * @param {boolean} [opts.isAdmin=false]        Return full object (admin only)
 * @returns {Object|null}
 */
export const serializePublicProvider = (provider, { includeUserId = false, isAdmin = false } = {}) => {
  if (!provider) return null;

  const p = typeof provider.toObject === 'function' ? provider.toObject() : { ...provider };

  // Admin gets everything
  if (isAdmin) return p;

  // Public safe fields only
  const safe = {
    _id: p._id,
    name: p.name,
    city: p.city,
    serviceArea: p.serviceArea || '',
    specialty: p.specialty || 'General Home Services',
    experienceYears: p.experienceYears ?? 0,
    status: p.status,
    verifiedBadge: p.verifiedBadge ?? false,
    isOnline: p.isOnline ?? false,
    ratingAvg: typeof p.ratingAvg === 'number' && p.ratingCount > 0 ? p.ratingAvg : null,
    ratingCount: p.ratingCount ?? 0,
    jobsDone: p.jobsDone ?? 0,
    badges: Array.isArray(p.badges) ? p.badges : [],
    profilePhoto: p.profilePhoto || null,
    // Public skill summary: only approved+passed skills, no test score, no internal status detail
    skills: Array.isArray(p.skills)
      ? p.skills
          .filter((s) => s.passed && s.status === 'approved')
          .map((s) => ({
            categoryId: s.categoryId,
            categoryName: s.categoryName,
            badge: s.badge || '',
            verifiedAt: s.verifiedAt || null,
          }))
      : [],
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };

  if (includeUserId) {
    safe.userId = p.userId;
  }

  return safe;
};

export default serializePublicProvider;
