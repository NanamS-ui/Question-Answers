import { Router } from "express";
import {
  addQuestion,
  createQuestionnaire,
  deleteQuestion,
  deleteQuestionnaire,
  getQuestionnaire,
  listQuestionnaires,
  updateQuestion,
  updateQuestionnaire,
} from "../../controllers/admin/questionnairesController";

export const adminQuestionnairesRouter = Router();

adminQuestionnairesRouter.get("/", listQuestionnaires);
adminQuestionnairesRouter.post("/", createQuestionnaire);
adminQuestionnairesRouter.get("/:id", getQuestionnaire);
adminQuestionnairesRouter.put("/:id", updateQuestionnaire);
adminQuestionnairesRouter.delete("/:id", deleteQuestionnaire);

adminQuestionnairesRouter.post("/:id/questions", addQuestion);
adminQuestionnairesRouter.put("/:id/questions/:questionId", updateQuestion);
adminQuestionnairesRouter.delete("/:id/questions/:questionId", deleteQuestion);
