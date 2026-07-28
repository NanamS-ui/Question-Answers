import { NextFunction, Request, Response } from "express";
import { supabase } from "../../config/supabase";
import { HttpError } from "../../middleware/errorHandler";
import { Questionnaire } from "../../types/domain";
import { attachQuestions } from "../../utils/questionnaires";
import { assertValidQuestionType, normalizeOptions } from "../../utils/validation";

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
  _req: Request,
  res: Response,
  next: NextFunction
) {
  // A new questionnaire has no questions yet, so it starts inactive
  // (addQuestion flips it active once it has at least one question).
  const { data, error } = await supabase
    .from("questionnaires")
    .insert({ is_active: false })
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
  const { is_active } = req.body;

  const { data, error } = await supabase
    .from("questionnaires")
    .update({ is_active })
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
  const { libelle, type, position, is_explanation } = req.body;

  if (!libelle || typeof libelle !== "string") {
    return next(new HttpError(400, "libelle est requis"));
  }
  try {
    assertValidQuestionType(type);
  } catch (err) {
    return next(err);
  }
  const options = normalizeOptions(req.body.options);
  if (!options || options.length < 2) {
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
      is_explanation: is_explanation ?? false,
    })
    .select()
    .single();

  if (error) return next(new HttpError(500, error.message));

  // This questionnaire now has at least one question: make it visible publicly.
  const { error: activateError } = await supabase
    .from("questionnaires")
    .update({ is_active: true })
    .eq("id", req.params.id);

  if (activateError) return next(new HttpError(500, activateError.message));
  res.status(201).json(data);
}

export async function updateQuestion(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { libelle, type, position, is_explanation } = req.body;

  if (type !== undefined) {
    try {
      assertValidQuestionType(type);
    } catch (err) {
      return next(err);
    }
  }

  let options;
  if (req.body.options !== undefined) {
    options = normalizeOptions(req.body.options);
    if (!options) {
      return next(new HttpError(400, "options invalides"));
    }
  }

  const { data, error } = await supabase
    .from("questions")
    .update({ libelle, type, options, position, is_explanation })
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

  // If that was the last question, hide the questionnaire from the public site again.
  const { count, error: countError } = await supabase
    .from("questions")
    .select("id", { count: "exact", head: true })
    .eq("questionnaire_id", req.params.id);

  if (countError) return next(new HttpError(500, countError.message));

  if (count === 0) {
    const { error: deactivateError } = await supabase
      .from("questionnaires")
      .update({ is_active: false })
      .eq("id", req.params.id);

    if (deactivateError) return next(new HttpError(500, deactivateError.message));
  }

  res.status(204).send();
}
