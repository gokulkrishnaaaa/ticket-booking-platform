import { Request, Response } from "express";
import { HTTP_STATUS } from "../../constants/http-status-codes";
import { createTheater as createTheaterService } from "./theater.service";

export async function createTheater(req: Request, res: Response) {
  const result = await createTheaterService(req.user!.id, req.body);

  return res.status(HTTP_STATUS.CREATED).json({
    success: true,
    data: {
      id: result.id,
      name: result.name,
      phoneNumber: result.phoneNumber,
      isActive: result.isActive,
      street: result.street,
      city: result.city,
      state: result.state,
      postalCode: result.postalCode,
      country: result.country,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    },
  });
}
