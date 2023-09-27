import { TokenService } from "@medusajs/medusa";
import { RequestHandler } from "express";
import { MedusaError } from "medusa-core-utils";

export const verifyAuthTokenMiddleware: RequestHandler = async (
  req,
  res,
  next
) => {
  const tokenService: TokenService = req.scope.resolve("tokenService");
  const authHeader = req.headers["authorization"];
  const token = authHeader?.substring(7);

  if (!token) {
    // throw new MedusaError(
    //   MedusaError.Types.UNAUTHORIZED,
    //   `Unauthorized access, token is required`
    // );
    res.status(403).send("Unauthorized access, token is required");
    return;
  }

  try {
    const tokenVerified = tokenService.verifyToken(token);
    req.user = tokenVerified;
    next();
  } catch (error: any) {
    if (error && error.name && error.name === "TokenExpiredError") {
      res.status(403).send("Unauthorized access, token has been expired");
    } else {
      next(error);
    }
  }
};
