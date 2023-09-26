import { TokenService } from "@medusajs/medusa";
import { RequestHandler } from "express";
import { MedusaError } from "medusa-core-utils";

export const themeCustomizabilityCheckMiddleware: RequestHandler = async (
  req,
  res,
  next
) => {
  const tokenService: TokenService = req.scope.resolve("tokenService");
  const token = req.cookies.MoveShop_admin_jwt;

  if (!token) {
    throw new MedusaError(
      MedusaError.Types.UNAUTHORIZED,
      `Unauthorized access, token is required`
    );
  }

  try {
    const tokenVerified = tokenService.verifyToken(token);
    if (!tokenVerified) {
      throw new MedusaError(
        MedusaError.Types.UNAUTHORIZED,
        `Unauthorized access, token is required`
      );
    } else {
      req.user = tokenVerified;
    }

    next();
  } catch (e) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Internal server error`);
  }
};
