import { HttpError } from "../middleware/errorHandler";
import { Question, QuestionType } from "../types/domain";

export const QUESTION_TYPES: QuestionType[] = ["radio", "checkbox", "select"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function assertValidEmail(email: string) {
  if (!EMAIL_RE.test(email)) {
    throw new HttpError(400, "Adresse email invalide");
  }
}

export function assertValidQuestionType(type: string): asserts type is QuestionType {
  if (!QUESTION_TYPES.includes(type as QuestionType)) {
    throw new HttpError(
      400,
      `type invalide: doit être l'un de ${QUESTION_TYPES.join(", ")}`
    );
  }
}

export function validateAnswerValue(
  question: Question,
  value: unknown
): string | string[] {
  if (question.type === "checkbox") {
    if (!Array.isArray(value) || !value.every((v) => typeof v === "string")) {
      throw new HttpError(
        400,
        `La réponse à "${question.libelle}" doit être une liste de choix`
      );
    }
    const invalid = value.filter((v) => !question.options.includes(v));
    if (invalid.length > 0) {
      throw new HttpError(
        400,
        `Choix invalide(s) pour "${question.libelle}": ${invalid.join(", ")}`
      );
    }
    return value;
  }

  if (typeof value !== "string" || !question.options.includes(value)) {
    throw new HttpError(400, `Réponse invalide pour "${question.libelle}"`);
  }
  return value;
}
