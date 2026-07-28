import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  HelpCircle,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { addQuestion, deleteQuestion, getQuestionnaire, updateQuestion } from "../../api/admin";
import type {
  Question,
  QuestionInput,
  QuestionnaireWithQuestions,
  QuestionType,
} from "../../types/domain";

const TYPE_LABELS: Record<QuestionType, string> = {
  radio: "Choix unique (radio)",
  checkbox: "Choix multiple (checkbox)",
  select: "Liste déroulante (select)",
};

interface QuestionFormProps {
  title?: string;
  initial?: Question;
  submitLabel: string;
  submitIcon: ReactNode;
  savingLabel: string;
  onSubmit: (input: QuestionInput) => Promise<void>;
  onCancel?: () => void;
}

function QuestionForm({
  title,
  initial,
  submitLabel,
  submitIcon,
  savingLabel,
  onSubmit,
  onCancel,
}: QuestionFormProps) {
  const [libelle, setLibelle] = useState(initial?.libelle ?? "");
  const [type, setType] = useState<QuestionType>(initial?.type ?? "radio");
  const [options, setOptions] = useState<string[]>(
    initial && initial.options.length > 0 ? initial.options.map((o) => o.value) : ["", ""]
  );
  const [otherIndex, setOtherIndex] = useState<number | null>(() => {
    const idx = initial?.options.findIndex((o) => o.is_other) ?? -1;
    return idx === -1 ? null : idx;
  });
  const [isExplanation, setIsExplanation] = useState(initial?.is_explanation ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!libelle.trim()) return;

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
      await onSubmit({ libelle, type, options: cleanedOptions, is_explanation: isExplanation });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      {title && <h3>{title}</h3>}
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

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={saving || !libelle.trim()}>
          {saving ? (
            <>
              <Loader2 size={18} className="icon-spin" aria-hidden="true" />
              {savingLabel}
            </>
          ) : (
            <>
              {submitIcon}
              {submitLabel}
            </>
          )}
        </button>
        {onCancel && (
          <button type="button" className="btn-ghost" onClick={onCancel} disabled={saving}>
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}

export function AdminQuestionnaireDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireWithQuestions | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

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

  async function handleAdd(input: QuestionInput) {
    if (!id) return;
    await addQuestion(id, input);
    // A questionnaire holds a single question, so once it's added there's
    // nothing left to do here.
    navigate("/admin");
  }

  async function handleUpdate(questionId: string, input: QuestionInput) {
    if (!id) return;
    await updateQuestion(id, questionId, input);
    setEditingId(null);
    await refresh();
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
          {questionnaire.questions.map((q, index) =>
            editingId === q.id ? (
              <li key={q.id} className="card question-item fade-in-up">
                <QuestionForm
                  initial={q}
                  submitLabel="Enregistrer"
                  submitIcon={<Pencil size={18} aria-hidden="true" />}
                  savingLabel="Enregistrement..."
                  onSubmit={(input) => handleUpdate(q.id, input)}
                  onCancel={() => setEditingId(null)}
                />
              </li>
            ) : (
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
                <div className="question-item-actions">
                  <button type="button" className="btn-ghost" onClick={() => setEditingId(q.id)}>
                    <Pencil size={16} aria-hidden="true" />
                    Modifier
                  </button>
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={() => handleDeleteQuestion(q.id, q.libelle)}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                    Supprimer
                  </button>
                </div>
              </li>
            )
          )}
        </ul>
      )}

      <QuestionForm
        title="Ajouter une question"
        submitLabel="Ajouter la question"
        submitIcon={<Plus size={18} aria-hidden="true" />}
        savingLabel="Ajout..."
        onSubmit={handleAdd}
      />
    </div>
  );
}
