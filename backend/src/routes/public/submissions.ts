import { Router } from "express";
import { createSubmission } from "../../controllers/public/submissionsController";

export const publicSubmissionsRouter = Router();

publicSubmissionsRouter.post("/", createSubmission);
