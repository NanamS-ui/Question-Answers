import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Loader2,
  MessageSquare,
  PackageOpen,
  Send,
  UserRound,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
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
  const [explanations, setExplanations] = useState<Record<string, string>>({});

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
        prenom: prenom || undefined,
        open_answer: openAnswer || undefined,
        answers: Object.entries(answers).map(([question_id, value]) => ({
          question_id,
          value,
          explanation: explanations[question_id] || undefined,
        })),
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <p className="page loading-state">
        <Loader2 size={18} className="icon-spin" aria-hidden="true" />
        Chargement...
      </p>
    );
  }

  if (submitted) {
    return (
      <div className="page">
        <div className="card success-screen fade-in-up">
          <span className="success-badge scale-in" aria-hidden="true">
            <CheckCircle2 size={36} strokeWidth={2} />
          </span>
          <h1>Merci !</h1>
          <p>Vos réponses ont bien été envoyées.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="hero fade-in-up">
        <Link to="/admin" className="hero-icon" aria-label="Accès administrateur">
          <ClipboardList size={26} aria-hidden="true" />
        </Link>
        <h1>Rijam-panontaniana</h1>
        <p className="subtitle">entina hanaporofoina sy hikirakirana ny fisarihan’ny votoaty
fampahalalam-baovao amin’ny tamban-tsera Fesiboky</p>
      </div>

      <form onSubmit={handleSubmit}>
        <fieldset className="identity card fade-in-up">
          <legend>Vos informations</legend>
          <div className="input-icon-wrapper">
            <UserRound size={18} className="input-icon" aria-hidden="true" />
            <input
              type="text"
              placeholder="Nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
            />
          </div>
          <div className="input-icon-wrapper">
            <UserRound size={18} className="input-icon" aria-hidden="true" />
            <input
              type="text"
              placeholder="Prénom (optionnel)"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
            />
          </div>
        </fieldset>

        {questionnaires.length === 0 && (
          <div className="empty-state">
            <PackageOpen size={32} aria-hidden="true" />
            <p>Aucun questionnaire disponible pour le moment.</p>
          </div>
        )}

        {questionnaires.map((questionnaire, index) => (
          <section
            key={questionnaire.id}
            className={`questionnaire card fade-in-up delay-${Math.min(index, 5)}`}
          >
            <div className="questionnaire-heading">
              <span className="questionnaire-index">{index + 1}</span>
              <h2>Fanontaniana {index + 1}</h2>
            </div>
            {questionnaire.questions.map((question) => (
              <QuestionField
                key={question.id}
                question={question}
                value={answers[question.id]}
                onChange={(value) =>
                  setAnswers((prev) => ({ ...prev, [question.id]: value }))
                }
                explanation={explanations[question.id]}
                onExplanationChange={(explanation) =>
                  setExplanations((prev) => ({ ...prev, [question.id]: explanation }))
                }
              />
            ))}
          </section>
        ))}

        <div className="card fade-in-up">
          <div className="question-field">
            <label htmlFor="open-answer">
              <MessageSquare size={30} className="label-icon" aria-hidden="true" />
              Araka ny hevitrao, inona no tokony ataon’ny vondrona fahitalavitra I-BC mba
hanatsarana ny fampielezan’izy ireo vaovao amin’ny Pejy Fesiboky ? 
            </label>
            <textarea
              id="open-answer"
              value={openAnswer}
              onChange={(e) => setOpenAnswer(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <p className="error fade-in">
            <AlertCircle size={16} aria-hidden="true" />
            Erreur : {error}
          </p>
        )}

        <button type="submit" className="btn-primary btn-lg" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 size={18} className="icon-spin" aria-hidden="true" />
              Envoi...
            </>
          ) : (
            <>
              <Send size={18} aria-hidden="true" />
              Envoyer
            </>
          )}
        </button>
      </form>
    </div>
  );
}
