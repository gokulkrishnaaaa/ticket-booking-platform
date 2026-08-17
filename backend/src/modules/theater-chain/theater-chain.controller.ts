import { Request, Response } from "express";
import { HTTP_STATUS } from "../../constants/http-status-codes";
import {
  registerTheaterChain as registerTheaterChainService,
  verifyTheaterChain as verifyTheaterChainService,
} from "./theater-chain.service";

type VerifyTheaterChainParams = {
  id: string;
};

export async function registerTheaterChain(req: Request, res: Response) {
  const result = await registerTheaterChainService(req.body);

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role,
      theaterChain: {
        id: result.theaterChain.id,
        companyName: result.theaterChain.companyName,
        phoneNumber: result.theaterChain.phoneNumber,
        address: result.theaterChain.address,
        isVerified: result.theaterChain.isVerified,
      },
    },
  });
}

export async function verifyTheaterChain(
  req: Request<VerifyTheaterChainParams>,
  res: Response,
) {
  const result = await verifyTheaterChainService(req.params.id);

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result,
  });
}
