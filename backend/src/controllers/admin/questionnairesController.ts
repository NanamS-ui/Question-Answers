import { NextFunction, Request, Response } from "express";
import { supabase } from "../../config/supabase";
import { HttpError } from "../../middleware/errorHandler";
import { Questionnaire } from "../../types/domain";
import { attachQuestions } from "../../utils/questionnaires";
import { assertValidQuestionType } from "../../utils/validation";

export async function listQuestionnaires(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  const { data, error } = await supabase
    .from("questionnaires")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return next(new HttpError(500, error.message));

  res.json(await attachQuestions(data as Questionnaire[]));
}

export async function getQuestionnaire(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { data, error } = await supabase
    .from("questionnaires")
    .select("*")
    .eq("id", req.params.id)
    .single();

  if (error) return next(new HttpError(404, "Questionnaire introuvable"));

  const [withQuestions] = await attachQuestions([data as Questionnaire]);
  res.json(withQuestions);
}

export async function createQuestionnaire(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { title, description, is_active } = req.body;
  if (!title || typeof title !== "string") {
    return next(new HttpError(400, "title est requis"));
  }

  const { data, error } = await supabase
    .from("questionnaires")
    .insert({ title, description, is_active: is_active ?? true })
    .select()
    .single();

  if (error) return next(new HttpError(500, error.message));
  res.status(201).json({ ...data, questions: [] });
}

export async function updateQuestionnaire(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { title, description, is_active } = req.body;

  const { data, error } = await supabase
    .from("questionnaires")
    .update({ title, description, is_active })
    .eq("id", req.params.id)
    .select()
    .single();

  if (error) return next(new HttpError(500, error.message));
  res.json(data);
}

export async function deleteQuestionnaire(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { error } = await supabase
    .from("questionnaires")
    .delete()
    .eq("id", req.params.id);

  if (error) return next(new HttpError(500, error.message));
  res.status(204).send();
}

export async function addQuestion(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { libelle, type, options, position } = req.body;

  if (!libelle || typeof libelle !== "string") {
    return next(new HttpError(400, "libelle est requis"));
  }
  try {
    assertValidQuestionType(type);
  } catch (err) {
    return next(err);
  }
  if (!Array.isArray(options) || options.length < 2) {
    return next(
      new HttpError(400, "options doit contenir au moins 2 choix")
    );
  }

  const { data, error } = await supabase
    .from("questions")
    .insert({
      questionnaire_id: req.params.id,
      libelle,
      type,
      options,
      position: position ?? 0,
    })
    .select()
    .single();

  if (error) return next(new HttpError(500, error.message));
  res.status(201).json(data);
}

export async function updateQuestion(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { libelle, type, options, position } = req.body;

  if (type !== undefined) {
    try {
      assertValidQuestionType(type);
    } catch (err) {
      return next(err);
    }
  }

  const { data, error } = await supabase
    .from("questions")
    .update({ libelle, type, options, position })
    .eq("id", req.params.questionId)
    .select()
    .single();

  if (error) return next(new HttpError(500, error.message));
  res.json(data);
}

export async function deleteQuestion(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { error } = await supabase
    .from("questions")
    .delete()
    .eq("id", req.params.questionId);

  if (error) return next(new HttpError(500, error.message));
  res.status(204).send();
}
