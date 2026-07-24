import { Router } from "express";
import { listSubmissions } from "../../controllers/admin/submissionsController";

export const adminSubmissionsRouter = Router();

adminSubmissionsRouter.get("/", listSubmissions);
