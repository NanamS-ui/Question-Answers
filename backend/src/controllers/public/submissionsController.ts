import { NextFunction, Request, Response } from "express";
import { supabase } from "../../config/supabase";
import { HttpError } from "../../middleware/errorHandler";
import { AnswerInput, Question, SubmissionInput } from "../../types/domain";
import { validateAnswerValue } from "../../utils/validation";

function assertValidInput(body: unknown): asserts body is SubmissionInput {
  const b = body as Partial<SubmissionInput> | null;
  if (!b || typeof b !== "object") {
    throw new HttpError(400, "Corps de requête invalide");
  }
  if (!b.nom?.trim()) throw new HttpError(400, "nom est requis");
  if (!b.prenom?.trim()) throw new HttpError(400, "prenom est requis");
  if (!Array.isArray(b.answers)) {
    throw new HttpError(400, "answers doit être un tableau");
  }
}

export async function createSubmission(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    assertValidInput(req.body);
  } catch (err) {
    return next(err);
  }

  const { nom, prenom, open_answer, answers } = req.body as SubmissionInput;

  const questionIds = answers.map((a: AnswerInput) => a.question_id);
  let questions: Question[] = [];

  if (questionIds.length > 0) {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .in("id", questionIds);

    if (error) return next(new HttpError(500, error.message));
    questions = data as Question[];

    if (questions.length !== new Set(questionIds).size) {
      return next(new HttpError(400, "Une ou plusieurs questions sont introuvables"));
    }
  }

  try {
    for (const answer of answers) {
      const question = questions.find((q) => q.id === answer.question_id)!;
      validateAnswerValue(question, answer.value);
    }
  } catch (err) {
    return next(err);
  }

  const { data: submission, error: submissionError } = await supabase
    .from("submissions")
    .insert({ nom, prenom, open_answer })
    .select()
    .single();

  if (submissionError) return next(new HttpError(500, submissionError.message));

  if (answers.length > 0) {
    const { data: insertedAnswers, error: answersError } = await supabase
      .from("answers")
      .insert(
        answers.map((a: AnswerInput) => ({
          submission_id: submission.id,
          question_id: a.question_id,
          value: a.value,
        }))
      )
      .select();

    if (answersError) {
      await supabase.from("submissions").delete().eq("id", submission.id);
      return next(new HttpError(500, answersError.message));
    }

    return res.status(201).json({ ...submission, answers: insertedAnswers });
  }

  res.status(201).json({ ...submission, answers: [] });
}
