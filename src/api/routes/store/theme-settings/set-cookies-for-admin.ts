import { TokenService } from "@medusajs/medusa";
import { RequestHandler } from "express";
import { appConfig } from "../../../../utils/app-config";

export const setCookiesForAdminHandler: RequestHandler = async (
  req,
  res,
  next
) => {
  const tokenService: TokenService = req.scope.resolve("tokenService");

  try {
    const { exp, ...rest } = req.user as any;

    const newLongExpireToken = tokenService.signToken(
      { ...rest },
      { expiresIn: appConfig.jwt_long_expire }
    );

    res.cookie(appConfig.moveShop_admin_jwt_cookies_key, newLongExpireToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: appConfig.moveShop_admin_jwt_cookies_expire,
    });

    res.json({ message: newLongExpireToken });
  } catch (error) {
    return res.send({ error: error });
  }
};
