import { TokenService, UserService } from "@medusajs/medusa";
import { RequestHandler } from "express";
import { MedusaError } from "medusa-core-utils";
import { appConfig } from "../../../../utils/app-config";

export const generateAuthTokenHandler: RequestHandler = async (req, res) => {
  const tokenService: TokenService = req.scope.resolve("tokenService");
  const userService: UserService = req.scope.resolve("userService");
  const user = req.user;

  if (!user?.userId) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "User id not found");
  }

  const currentUser = await userService.retrieve(user?.userId);
  const userTokenData = {
    email: currentUser.email,
    id: currentUser.id,
    role: currentUser.role,
  };

  // create short expire token for admin
  const token = tokenService.signToken(
    { ...userTokenData },
    { expiresIn: appConfig.jwt_short_expire }
  );

  const redirect_url = `${appConfig.store_front_url}/edit/?token=${token}&user_id=${currentUser.id}`;

  res.status(200).json({
    redirect_url,
    token,
  });
};
