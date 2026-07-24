import { supabase } from "../config/supabase";
import { HttpError } from "../middleware/errorHandler";
import { Question, Questionnaire, QuestionnaireWithQuestions } from "../types/domain";

export async function attachQuestions(
  questionnaires: Questionnaire[]
): Promise<QuestionnaireWithQuestions[]> {
  const ids = questionnaires.map((q) => q.id);
  if (ids.length === 0) return [];

  const { data: questions, error } = await supabase
    .from("questions")
    .select("*")
    .in("questionnaire_id", ids)
    .order("position", { ascending: true });

  if (error) throw new HttpError(500, error.message);

  return questionnaires.map((questionnaire) => ({
    ...questionnaire,
    questions: (questions as Question[]).filter(
      (q) => q.questionnaire_id === questionnaire.id
    ),
  }));
}
