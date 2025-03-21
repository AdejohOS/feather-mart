/**
 * The prefix for seller routes
 * Routes that start with this prefix are only accessible by seller
 * @type {string}
 */
export const sellerPrefix = "/vendor-marketplace";

/**
 * An array of routes that are used for authentication
 * These routes will redirect logged in sellers to /vendor-marketplace
 * @type {string[]}
 */
export const sellerAuthRoutes = ["/vendor-market/auth/sign-in", "/vendor-market/auth/sign-up",];