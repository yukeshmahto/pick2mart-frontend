/**
 * Role-Based Redirection and Authorization Utility
 * Ensures secure, role-aware routing across Pick2Mart portals.
 */

export const USER_ROLES = {
  ADMIN: 'admin',
  SELLER: 'seller',
  DELIVERY_PARTNER: 'delivery_partner',
  CUSTOMER: 'customer',
};

/**
 * Returns the default portal/destination for a given user role.
 */
export function getRoleDefaultPath(role) {
  switch (role) {
    case USER_ROLES.ADMIN:
      return '/admin';
    case USER_ROLES.SELLER:
      return '/seller';
    case USER_ROLES.DELIVERY_PARTNER:
      return '/delivery';
    case USER_ROLES.CUSTOMER:
      return '/profile';
    default:
      return '/';
  }
}

/**
 * Checks if a destination path is allowed for a user role.
 * Prevents unauthorized portal access and cross-role navigation.
 */
export function isPathAllowedForRole(path, role) {
  if (!path || typeof path !== 'string') return false;

  const cleanPath = path.toLowerCase().split('?')[0].split('#')[0];

  // Admin routes: ONLY admin
  if (cleanPath.startsWith('/admin')) {
    return role === USER_ROLES.ADMIN;
  }

  // Seller routes: ONLY seller and admin
  if (cleanPath.startsWith('/seller')) {
    return role === USER_ROLES.SELLER || role === USER_ROLES.ADMIN;
  }

  // Delivery routes: ONLY delivery_partner and admin
  if (cleanPath.startsWith('/delivery')) {
    return role === USER_ROLES.DELIVERY_PARTNER || role === USER_ROLES.ADMIN;
  }

  // General customer / storefront routes (profile, checkout, orders, shop, etc.):
  // Allowed for any logged in user
  return true;
}

/**
 * Validates a redirect parameter and resolves the safest target URL.
 * Defends against Open Redirect vulnerabilities and role permission mismatches.
 */
export function resolvePostLoginRedirect(redirectParam, userRole) {
  const defaultPath = getRoleDefaultPath(userRole);

  if (!redirectParam || typeof redirectParam !== 'string') {
    return defaultPath;
  }

  const trimmed = redirectParam.trim();

  // Validate relative path to protect against Open Redirects:
  // Must start with '/' and must NOT start with '//' or contain '://'
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.includes('://') || trimmed.includes('\\')) {
    return defaultPath;
  }

  // Check if destination is allowed for this role
  if (isPathAllowedForRole(trimmed, userRole)) {
    return trimmed;
  }

  // If redirect is not allowed for this role, return the role's default portal
  return defaultPath;
}

/**
 * Cleanly logs out user by clearing session storage and tokens
 */
export function clearAuthSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
}
