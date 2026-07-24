import { useEffect, useState, type FormEvent } from "react";
import { listActiveQuestionnaires, submitAnswers } from "../api/public";
import { QuestionField } from "../components/QuestionField";
import type { QuestionnaireWithQuestions } from "../types/domain";

export function PublicSurveyPage() {
  const [questionnaires, setQuestionnaires] = useState<QuestionnaireWithQuestions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [openAnswer, setOpenAnswer] = useState("");
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

  useEffect(() => {
    listActiveQuestionnaires()
      .then(setQuestionnaires)
      .catch((err) => setError(err instanceof Error ? err.message : "Nisy olana tsy fantatra"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await submitAnswers({
        nom,
        prenom,
        open_answer: openAnswer || undefined,
        answers: Object.entries(answers).map(([question_id, value]) => ({
          question_id,
          value,
        })),
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nisy olana tsy fantatra");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p>Miandry kely...</p>;

  if (submitted) {
    return (
      <div className="page">
        <h1>Misaotra !</h1>
        <p>Voaray tsara ny valin-teninao.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Rijam-panontaniana</h1>
      <p className="subtitle">ho an'ny Vahoaka Ankapobeny momba ny anjara asan'ny IB-C manoloana ny vanim-potoana nomerika</p>
      <form onSubmit={handleSubmit} className="survey-form">
        <fieldset className="identity">
          <legend>Mombamomba anao</legend>
          <input
            type="text"
            placeholder="Anarana"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Fanampin'anarana"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            required
          />
        </fieldset>

        {questionnaires.length === 0 && (
          <p>Tsy misy rijam-panontaniana azo valiana amin'izao fotoana izao.</p>
        )}

        {questionnaires.map((questionnaire) => (
          <section key={questionnaire.id} className="questionnaire">
            <h2>{questionnaire.title}</h2>
            {questionnaire.description && <p>{questionnaire.description}</p>}
            {questionnaire.questions.map((question) => (
              <QuestionField
                key={question.id}
                question={question}
                value={answers[question.id]}
                onChange={(value) =>
                  setAnswers((prev) => ({ ...prev, [question.id]: value }))
                }
              />
            ))}
          </section>
        ))}

        <div className="question-field">
          <label htmlFor="open-answer">Hevitra na fanamarihana hafa</label>
          <textarea
            id="open-answer"
            value={openAnswer}
            onChange={(e) => setOpenAnswer(e.target.value)}
          />
        </div>

        {error && <p className="error">Olana: {error}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? "Mandefa..." : "Alefa"}
        </button>
      </form>
    </div>
  );
}
