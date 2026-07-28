import { HttpError } from "../middleware/errorHandler";
import { Question, QuestionOption, QuestionType } from "../types/domain";

export const QUESTION_TYPES: QuestionType[] = ["radio", "checkbox", "select"];

export function assertValidQuestionType(type: string): asserts type is QuestionType {
  if (!QUESTION_TYPES.includes(type as QuestionType)) {
    throw new HttpError(
      400,
      `type invalide: doit être l'un de ${QUESTION_TYPES.join(", ")}`
    );
  }
}

export function normalizeOptions(input: unknown): QuestionOption[] | null {
  if (!Array.isArray(input)) return null;

  const options = input.map((o): QuestionOption => {
    if (typeof o === "string") return { value: o.trim(), is_other: false };
    const value = typeof o?.value === "string" ? o.value.trim() : "";
    return { value, is_other: Boolean(o?.is_other) };
  });

  if (options.some((o) => !o.value)) return null;
  return options;
}

export function validateAnswerValue(
  question: Question,
  value: unknown
): string | string[] {
  const optionValues = question.options.map((o) => o.value);

  if (question.type === "checkbox") {
    if (!Array.isArray(value) || !value.every((v) => typeof v === "string")) {
      throw new HttpError(
        400,
        `La réponse à "${question.libelle}" doit être une liste de choix`
      );
    }
    const invalid = value.filter((v) => !optionValues.includes(v));
    if (invalid.length > 0) {
      throw new HttpError(
        400,
        `Choix invalide(s) pour "${question.libelle}": ${invalid.join(", ")}`
      );
    }
    return value;
  }

  if (typeof value !== "string" || !optionValues.includes(value)) {
    throw new HttpError(400, `Réponse invalide pour "${question.libelle}"`);
  }
  return value;
}
