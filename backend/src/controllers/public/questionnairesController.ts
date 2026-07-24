import { NextFunction, Request, Response } from "express";
import { supabase } from "../../config/supabase";
import { HttpError } from "../../middleware/errorHandler";
import { Questionnaire } from "../../types/domain";
import { attachQuestions } from "../../utils/questionnaires";

export async function listActiveQuestionnaires(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  const { data, error } = await supabase
    .from("questionnaires")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error) return next(new HttpError(500, error.message));

  res.json(await attachQuestions(data as Questionnaire[]));
}
