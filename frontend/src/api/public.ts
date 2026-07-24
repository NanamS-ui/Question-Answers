import { apiFetch } from "./client";
import type { QuestionnaireWithQuestions, SubmissionInput } from "../types/domain";

export function listActiveQuestionnaires() {
  return apiFetch<QuestionnaireWithQuestions[]>("/api/public/questionnaires");
}

export function submitAnswers(input: SubmissionInput) {
  return apiFetch<void>("/api/public/submissions", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
