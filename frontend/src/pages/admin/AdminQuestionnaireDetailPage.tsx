import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { addQuestion, deleteQuestion, getQuestionnaire } from "../../api/admin";
import type { QuestionnaireWithQuestions, QuestionType } from "../../types/domain";

const TYPE_LABELS: Record<QuestionType, string> = {
  radio: "Choix unique (radio)",
  checkbox: "Choix multiple (checkbox)",
  select: "Liste déroulante (select)",
};

const TYPE_PILL_CLASS: Record<QuestionType, string> = {
  radio: "type-pill type-pill--radio",
  checkbox: "type-pill type-pill--checkbox",
  select: "type-pill type-pill--select",
};

export function AdminQuestionnaireDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireWithQuestions | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [libelle, setLibelle] = useState("");
  const [type, setType] = useState<QuestionType>("radio");
  const [options, setOptions] = useState(["", ""]);
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

    const cleanedOptions = options.map((o) => o.trim()).filter(Boolean);
    if (cleanedOptions.length < 2) {
      setError("Il faut au moins 2 options");
      return;
    }

    setSaving(true);
    try {
      setError(null);
      await addQuestion(id, { libelle, type, options: cleanedOptions });
      setLibelle("");
      setType("radio");
      setOptions(["", ""]);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteQuestion(questionId: string) {
    if (!id) return;
    await deleteQuestion(id, questionId);
    await refresh();
  }

  if (!questionnaire) return <div className="page">{error ?? "Chargement..."}</div>;

  return (
    <div className="page">
      <p className="back-link">
        <Link to="/admin">&larr; Retour</Link>
      </p>
      <h1>{questionnaire.title}</h1>
      {questionnaire.description && <p className="questionnaire-description">{questionnaire.description}</p>}
      <p className="section-link">
        <Link to={`/admin/questionnaires/${questionnaire.id}/results`}>
          Voir les résultats
        </Link>
      </p>

      <h2>Questions</h2>
      <ul className="question-list">
        {questionnaire.questions.map((q) => (
          <li key={q.id} className="card">
            <div>
              <strong>{q.libelle}</strong>
              <p>
                <span className={TYPE_PILL_CLASS[q.type]}>{TYPE_LABELS[q.type]}</span>
                <span className="submission-meta"> {q.options.join(", ")}</span>
              </p>
            </div>
            <button type="button" className="btn-danger" onClick={() => handleDeleteQuestion(q.id)}>
              Supprimer
            </button>
          </li>
        ))}
      </ul>

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
          <input
            key={i}
            type="text"
            placeholder={`Option ${i + 1}`}
            value={option}
            disabled={saving}
            onChange={(e) =>
              setOptions((prev) => prev.map((o, idx) => (idx === i ? e.target.value : o)))
            }
          />
        ))}
        <button
          type="button"
          className="btn-ghost"
          onClick={() => setOptions((prev) => [...prev, ""])}
          disabled={saving}
        >
          + Option
        </button>

        {error && <p className="error">Erreur : {error}</p>}

        <button type="submit" className="btn-primary" disabled={saving || !libelle.trim()}>
          {saving ? "Ajout..." : "Ajouter la question"}
        </button>
      </form>
    </div>
  );
}
