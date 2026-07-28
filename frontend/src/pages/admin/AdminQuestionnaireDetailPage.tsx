import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  HelpCircle,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { addQuestion, deleteQuestion, getQuestionnaire } from "../../api/admin";
import type { QuestionnaireWithQuestions, QuestionType } from "../../types/domain";

const TYPE_LABELS: Record<QuestionType, string> = {
  radio: "Choix unique (radio)",
  checkbox: "Choix multiple (checkbox)",
  select: "Liste déroulante (select)",
};

export function AdminQuestionnaireDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireWithQuestions | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [libelle, setLibelle] = useState("");
  const [type, setType] = useState<QuestionType>("radio");
  const [options, setOptions] = useState(["", ""]);
  const [otherIndex, setOtherIndex] = useState<number | null>(null);
  const [isExplanation, setIsExplanation] = useState(false);
  const [saving, setSaving] = useState(false);

  async function refresh() {
    if (!id) return;
    try {
      setError(null);
      setQuestionnaire(await getQuestionnaire(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    }
  }

  useEffect(() => {
    refresh();
  }, [id]);

  async function handleAddQuestion(e: FormEvent) {
    e.preventDefault();
    if (!id || !libelle.trim()) return;

    const cleanedOptions = options
      .map((o, i) => ({ value: o.trim(), is_other: otherIndex === i }))
      .filter((o) => o.value);
    if (cleanedOptions.length < 2) {
      setError("Il faut au moins 2 options");
      return;
    }

    setSaving(true);
    try {
      setError(null);
      await addQuestion(id, {
        libelle,
        type,
        options: cleanedOptions,
        is_explanation: isExplanation,
      });
      // A questionnaire holds a single question, so once it's added there's
      // nothing left to do here.
      navigate("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteQuestion(questionId: string, libelle: string) {
    if (!id) return;
    if (!window.confirm(`Supprimer la question "${libelle}" ?`)) return;
    await deleteQuestion(id, questionId);
    await refresh();
  }

  if (!questionnaire) {
    return (
      <div className="page loading-state">
        {error ?? (
          <>
            <Loader2 size={18} className="icon-spin" aria-hidden="true" />
            Chargement...
          </>
        )}
      </div>
    );
  }

  return (
    <div className="page">
      <p className="back-link">
        <Link to="/admin">
          <ArrowLeft size={16} aria-hidden="true" /> Retour
        </Link>
      </p>
      <h1>Questions</h1>
      <p className="section-link">
        <Link to={`/admin/questionnaires/${questionnaire.id}/results`}>
          <BarChart3 size={16} aria-hidden="true" />
          Voir les résultats
        </Link>
      </p>

      {questionnaire.questions.length === 0 ? (
        <div className="empty-state">
          <HelpCircle size={32} aria-hidden="true" />
          <p>Aucune question pour l'instant. Ajoute-en une ci-dessous.</p>
        </div>
      ) : (
        <ul className="question-list">
          {questionnaire.questions.map((q, index) => (
            <li key={q.id} className={`card question-item fade-in-up delay-${Math.min(index, 5)}`}>
              <div className="question-item-body">
                <div className="question-item-heading">
                  <span className="question-index">{index + 1}</span>
                  <strong>{q.libelle}</strong>
                  {q.is_explanation && <span className="badge">explication demandée</span>}
                </div>
                <div className="option-chip-list">
                  {q.options.map((option) => (
                    <span key={option.value} className="option-chip">
                      {option.value}
                      {option.is_other && <span className="badge">autre</span>}
                    </span>
                  ))}
                </div>
              </div>
              <button
                type="button"
                className="btn-danger"
                onClick={() => handleDeleteQuestion(q.id, q.libelle)}
              >
                <Trash2 size={16} aria-hidden="true" />
                Supprimer
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAddQuestion} className="card">
        <h3>Ajouter une question</h3>
        <input
          type="text"
          placeholder="Question"
          value={libelle}
          onChange={(e) => setLibelle(e.target.value)}
          disabled={saving}
        />
        <select
          aria-label="Type de réponse"
          value={type}
          onChange={(e) => setType(e.target.value as QuestionType)}
          disabled={saving}
        >
          {Object.entries(TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        {options.map((option, i) => (
          <div key={i} className="option-input-row">
            <input
              type="text"
              placeholder={`Option ${i + 1}`}
              value={option}
              disabled={saving}
              onChange={(e) =>
                setOptions((prev) => prev.map((o, idx) => (idx === i ? e.target.value : o)))
              }
            />
            <label className="option-other-toggle">
              <input
                type="checkbox"
                checked={otherIndex === i}
                disabled={saving}
                onChange={(e) => setOtherIndex(e.target.checked ? i : null)}
              />
              « Autre »
            </label>
          </div>
        ))}
        <button
          type="button"
          className="btn-ghost"
          onClick={() => setOptions((prev) => [...prev, ""])}
          disabled={saving}
        >
          <Plus size={14} aria-hidden="true" />
          Option
        </button>

        <label className="option-choice">
          <input
            type="checkbox"
            checked={isExplanation}
            onChange={(e) => setIsExplanation(e.target.checked)}
            disabled={saving}
          />
          Demander une explication du choix
        </label>

        {error && (
          <p className="error fade-in">
            <AlertCircle size={16} aria-hidden="true" />
            Erreur : {error}
          </p>
        )}

        <button type="submit" className="btn-primary" disabled={saving || !libelle.trim()}>
          {saving ? (
            <>
              <Loader2 size={18} className="icon-spin" aria-hidden="true" />
              Ajout...
            </>
          ) : (
            <>
              <Plus size={18} aria-hidden="true" />
              Ajouter la question
            </>
          )}
        </button>
      </form>
    </div>
  );
}
