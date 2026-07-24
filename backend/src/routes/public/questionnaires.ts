import { Router } from "express";
import { listActiveQuestionnaires } from "../../controllers/public/questionnairesController";

export const publicQuestionnairesRouter = Router();

publicQuestionnairesRouter.get("/", listActiveQuestionnaires);
