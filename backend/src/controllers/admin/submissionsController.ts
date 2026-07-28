import { NextFunction, Request, Response } from "express";
import { supabase } from "../../config/supabase";
import { HttpError } from "../../middleware/errorHandler";
import { Answer, Submission } from "../../types/domain";

export async function listSubmissions(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  const { data: submissions, error: submissionsError } = await supabase
    .from("submissions")
    .select("*")
    .order("created_at", { ascending: false });

  if (submissionsError) return next(new HttpError(500, submissionsError.message));

  const submissionIds = (submissions as Submission[]).map((s) => s.id);
  if (submissionIds.length === 0) return res.json([]);

  const { data: answers, error: answersError } = await supabase
    .from("answers")
    .select("*, questions(libelle, questionnaire_id)")
    .in("submission_id", submissionIds);

  if (answersError) return next(new HttpError(500, answersError.message));

  res.json(
    (submissions as Submission[]).map((submission) => ({
      ...submission,
      answers: (answers as (Answer & Record<string, unknown>)[]).filter(
        (a) => a.submission_id === submission.id
      ),
    }))
  );
}
