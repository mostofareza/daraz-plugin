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
      { expiresIn: appConfig.jwtLongExpire }
    );

    res.cookie(appConfig.moveShopAdminJwtCookiesKey, newLongExpireToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: appConfig.moveShopAdminJwtCookiesExpire * 1000,
    });

    res.json({
      message: "successfully verified",
      success: true,
      result: req.user,
      token: newLongExpireToken,
    });
  } catch (error) {
    return res.send({ error: error });
  }
};
