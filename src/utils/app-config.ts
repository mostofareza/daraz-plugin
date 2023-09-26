// JWT_SHORT_EXPIRE=60
// JWT_LONG_EXPIRE=30 days
// STORE_FRONT_URL=http://localhost:3000

export const appConfig = {
  limit: 20,
  token: process.env.MOVEON_API_TOKEN || "",
  jwt_short_expire: process.env.JWT_SHORT_EXPIRE || "2m",
  jwt_long_expire: process.env.JWT_LONG_EXPIRE || "30 days",
  store_front_url: process.env.STORE_FRONT_URL || "http://localhost:3000",
  moveShop_admin_jwt_cookies_key: "MoveShop_admin_jwt",
  moveShop_admin_jwt_cookies_expire: 60 * 60 * 24 * 30,
};
