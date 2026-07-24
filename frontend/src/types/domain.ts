export type QuestionType = "radio" | "checkbox" | "select";

export interface Questionnaire {
  id: string;
  title: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Question {
  id: string;
  questionnaire_id: string;
  libelle: string;
  type: QuestionType;
  options: string[];
  position: number;
  created_at: string;
}

export interface QuestionnaireWithQuestions extends Questionnaire {
  questions: Question[];
}

export interface Submission {
  id: string;
  nom: string;
  prenom: string;
  open_answer: string | null;
  created_at: string;
}

export interface Answer {
  id: string;
  submission_id: string;
  question_id: string;
  value: string | string[];
}

export interface SubmissionWithAnswers extends Submission {
  answers: (Answer & {
    questions?: { libelle: string; questionnaires?: { title: string } };
  })[];
}

export interface AnswerInput {
  question_id: string;
  value: string | string[];
}

export interface SubmissionInput {
  nom: string;
  prenom: string;
  open_answer?: string;
  answers: AnswerInput[];
}

export interface QuestionInput {
  libelle: string;
  type: QuestionType;
  options: string[];
  position?: number;
}

export interface QuestionnaireInput {
  title: string;
  description?: string;
  is_active?: boolean;
}
