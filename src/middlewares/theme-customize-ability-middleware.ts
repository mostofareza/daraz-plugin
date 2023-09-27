import { TokenService } from "@medusajs/medusa";
import { RequestHandler } from "express";
import { MedusaError } from "medusa-core-utils";

export const checkThemeCustomizabilityMiddleware: RequestHandler = async (
  req,
  res,
  next
) => {
  const tokenService: TokenService = req.scope.resolve("tokenService");
  const token = req.cookies.MoveShop_admin_jwt;

  if (!token) {
    res.status(403).send("Unauthorized access, token is required");
  }

  try {
    const tokenVerified = tokenService.verifyToken(token);
    if (!tokenVerified) {
      res.status(403).send("Unauthorized access, token is required");
    } else {
      req.user = tokenVerified;
    }

    next();
  } catch (e) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Internal server error`);
  }
};
