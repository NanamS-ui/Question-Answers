import { apiFetch } from "./client";
import type {
  QuestionInput,
  QuestionnaireInput,
  QuestionnaireWithQuestions,
  SubmissionWithAnswers,
} from "../types/domain";

export function listQuestionnaires() {
  return apiFetch<QuestionnaireWithQuestions[]>("/api/admin/questionnaires");
}

export function getQuestionnaire(id: string) {
  return apiFetch<QuestionnaireWithQuestions>(`/api/admin/questionnaires/${id}`);
}

export function createQuestionnaire(input: QuestionnaireInput) {
  return apiFetch<QuestionnaireWithQuestions>("/api/admin/questionnaires", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateQuestionnaire(id: string, input: Partial<QuestionnaireInput>) {
  return apiFetch<QuestionnaireWithQuestions>(`/api/admin/questionnaires/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deleteQuestionnaire(id: string) {
  return apiFetch<void>(`/api/admin/questionnaires/${id}`, { method: "DELETE" });
}

export function addQuestion(questionnaireId: string, input: QuestionInput) {
  return apiFetch(`/api/admin/questionnaires/${questionnaireId}/questions`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateQuestion(
  questionnaireId: string,
  questionId: string,
  input: QuestionInput
) {
  return apiFetch(
    `/api/admin/questionnaires/${questionnaireId}/questions/${questionId}`,
    { method: "PUT", body: JSON.stringify(input) }
  );
}

export function deleteQuestion(questionnaireId: string, questionId: string) {
  return apiFetch<void>(
    `/api/admin/questionnaires/${questionnaireId}/questions/${questionId}`,
    { method: "DELETE" }
  );
}

export function listSubmissions() {
  return apiFetch<SubmissionWithAnswers[]>("/api/admin/submissions");
}
