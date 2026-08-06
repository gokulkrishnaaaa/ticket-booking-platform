import { Request, Response } from "express";
import { register as registerUser } from "./auth.service";
import { HTTP_STATUS } from "../../constants/http-status-codes";


export async function register(req: Request, res: Response) {
    const user = await registerUser(req.body);
    
    return res.status(HTTP_STATUS.CREATED).json({
        success : true,
        data : user,
    });
}

export async function login(req: Request, res: Response) {
    res.status(200).json({
        message : "Login endpoint is working"
    });
}