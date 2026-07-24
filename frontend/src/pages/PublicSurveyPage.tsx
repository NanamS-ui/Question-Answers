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
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur inconnue"))
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
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="page">Chargement...</p>;

  if (submitted) {
    return (
      <div className="page">
        <div className="card success-screen">
          <span className="success-badge" aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 13l4 4L19 7"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <h1>Merci !</h1>
          <p>Vos réponses ont bien été envoyées.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="hero">
        <h1>Rijam-panontaniana</h1>
        <p className="subtitle">ho an'ny Vahoaka Ankapobeny momba ny anjara asan'ny IB-C manoloana ny vanim-potoana nomerika</p>
      </div>

      <form onSubmit={handleSubmit}>
        <fieldset className="identity card">
          <legend>Vos informations</legend>
          <input
            type="text"
            placeholder="Nom"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Prénom"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            required
          />
        </fieldset>

        {questionnaires.length === 0 && (
          <p>Aucun questionnaire disponible pour le moment.</p>
        )}

        {questionnaires.map((questionnaire, index) => (
          <section key={questionnaire.id} className="questionnaire card">
            <div className="questionnaire-heading">
              <span className="questionnaire-index">{index + 1}</span>
              <h2>{questionnaire.title}</h2>
            </div>
            {questionnaire.description && (
              <p className="questionnaire-description">{questionnaire.description}</p>
            )}
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

        <div className="card">
          <div className="question-field">
            <label htmlFor="open-answer">Un commentaire à ajouter ?</label>
            <textarea
              id="open-answer"
              value={openAnswer}
              onChange={(e) => setOpenAnswer(e.target.value)}
            />
          </div>
        </div>

        {error && <p className="error">Erreur : {error}</p>}

        <button type="submit" className="btn-primary btn-lg" disabled={submitting}>
          {submitting ? "Envoi..." : "Envoyer"}
        </button>
      </form>
    </div>
  );
}
