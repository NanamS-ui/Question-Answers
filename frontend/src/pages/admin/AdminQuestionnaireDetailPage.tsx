import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  addQuestion,
  deleteQuestion,
  getQuestionnaire,
  updateQuestionnaire,
} from "../../api/admin";
import type { QuestionnaireWithQuestions, QuestionType } from "../../types/domain";

const TYPE_LABELS: Record<QuestionType, string> = {
  radio: "Safidy tokana (radio)",
  checkbox: "Safidy maro (checkbox)",
  select: "Lisitra mivelatra (select)",
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
      setError(err instanceof Error ? err.message : "Olana tsy fantatra");
    }
  }

  useEffect(() => {
    refresh();
  }, [id]);

  async function handleToggleActive() {
    if (!questionnaire) return;
    await updateQuestionnaire(questionnaire.id, { is_active: !questionnaire.is_active });
    await refresh();
  }

  async function handleAddQuestion(e: FormEvent) {
    e.preventDefault();
    if (!id || !libelle.trim()) return;

    const cleanedOptions = options.map((o) => o.trim()).filter(Boolean);
    if (cleanedOptions.length < 2) {
      setError("Mila safidy 2 farafahakeliny");
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
      setError(err instanceof Error ? err.message : "Olana tsy fantatra");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteQuestion(questionId: string) {
    if (!id) return;
    await deleteQuestion(id, questionId);
    await refresh();
  }

  if (!questionnaire) return <div className="page">{error ?? "Miandry kely..."}</div>;

  return (
    <div className="page">
      <p>
        <Link to="/admin">&larr; Miverina</Link>
      </p>
      <h1>{questionnaire.title}</h1>
      {questionnaire.description && <p>{questionnaire.description}</p>}
      <button type="button" onClick={handleToggleActive}>
        {questionnaire.is_active ? "Ajanony" : "Ampandehano"}
      </button>

      <h2>Fanontaniana</h2>
      <ul className="question-list">
        {questionnaire.questions.map((q) => (
          <li key={q.id}>
            <div>
              <strong>{q.libelle}</strong>
              <p>
                {TYPE_LABELS[q.type]} — {q.options.join(", ")}
              </p>
            </div>
            <button type="button" onClick={() => handleDeleteQuestion(q.id)}>
              Fafao
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleAddQuestion} className="question-form">
        <h3>Hampiditra fanontaniana</h3>
        <input
          type="text"
          placeholder="Fanontaniana"
          value={libelle}
          onChange={(e) => setLibelle(e.target.value)}
          disabled={saving}
        />
        <select
          aria-label="Karazana valiny"
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
            placeholder={`Safidy ${i + 1}`}
            value={option}
            disabled={saving}
            onChange={(e) =>
              setOptions((prev) => prev.map((o, idx) => (idx === i ? e.target.value : o)))
            }
          />
        ))}
        <button
          type="button"
          onClick={() => setOptions((prev) => [...prev, ""])}
          disabled={saving}
        >
          + Safidy
        </button>

        {error && <p className="error">Olana: {error}</p>}

        <button type="submit" disabled={saving || !libelle.trim()}>
          {saving ? "Eo am-panampiana..." : "Ampio ny fanontaniana"}
        </button>
      </form>
    </div>
  );
}
