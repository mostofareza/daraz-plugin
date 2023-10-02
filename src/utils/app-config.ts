import * as dotenv from 'dotenv';
dotenv.config();

// note
//  keep same expire date for jwt_long_expire and moveShop_admin_jwt_cookies_expire

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_SECRET = process.env.COOKIE_SECRET;

const JWT_SHORT_EXPIRE = process.env.JWT_SHORT_EXPIRE;
const JWT_LONG_EXPIRE = process.env.JWT_LONG_EXPIRE;
const STORE_FRONT_URL = process.env.STORE_FRONT_URL;

const DATABASE_TYPE = process.env.DATABASE_TYPE;
const DATABASE_PORT = process.env.DATABASE_PORT;
const DATABASE_USERNAME = process.env.DATABASE_USERNAME;
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD;
const DTABASE_NAME = process.env.DATABASE_NAME;
const DATABASE_URL = process.env.DATABASE_URL;
const REDIS_URL = process.env.REDIS_URL;
const MOVEON_API_TOKEN = process.env.MOVEON_API_TOKEN;

export const appConfig = {
  limit: 20,
  token: MOVEON_API_TOKEN || "",
  jwtShortExpire: JWT_SHORT_EXPIRE || "2m",
  jwtLongExpire: JWT_LONG_EXPIRE || "30 days",
  storeFrontUrl: STORE_FRONT_URL || "http://localhost:3000",
  moveShopAdminJwtCookiesKey: "MoveShop_admin_jwt",
  moveShopAdminJwtCookiesExpire: 60 * 60 * 24 * 30 * 1000,
  jwtSecret: JWT_SECRET,
  cookieSecret: COOKIE_SECRET,
  databaseType: DATABASE_TYPE,
  databasePort: DATABASE_PORT,
  databaseUsername: DATABASE_USERNAME,
  databasePassword: DATABASE_PASSWORD,
  databaseName: DTABASE_NAME,
  databaseUrl: DATABASE_URL,
  redisUrl: REDIS_URL,
};
