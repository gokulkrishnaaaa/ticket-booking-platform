import { Request, Response } from "express";

export async function register(req: Request, res: Response) {
    res.status(201).json({
        message : "Register endpoint is working"
    });
}

export async function login(req: Request, res: Response) {
    res.status(200).json({
        message : "Login endpoint is working"
    });
}