import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  createQuestionnaire,
  deleteQuestionnaire,
  listQuestionnaires,
} from "../../api/admin";
import type { QuestionnaireWithQuestions } from "../../types/domain";

export function AdminDashboardPage() {
  const [questionnaires, setQuestionnaires] = useState<QuestionnaireWithQuestions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  async function refresh() {
    try {
      setError(null);
      setQuestionnaires(await listQuestionnaires());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Olana tsy fantatra");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    try {
      await createQuestionnaire({ title, description: description || undefined });
      setTitle("");
      setDescription("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Olana tsy fantatra");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    await deleteQuestionnaire(id);
    await refresh();
  }

  return (
    <div className="page">
      <h1>Fitantanana</h1>
      <p>
        <Link to="/admin/submissions">Jereo ny valin-tenin'ny mpampiasa</Link>
      </p>

      <form onSubmit={handleCreate} className="questionnaire-form">
        <h2>Rijam-panontaniana vaovao</h2>
        <input
          type="text"
          placeholder="Lohateny"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={creating}
        />
        <textarea
          placeholder="Famaritana (tsy voatery)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={creating}
        />
        <button type="submit" disabled={creating || !title.trim()}>
          {creating ? "Eo am-pamoronana..." : "Mamorona"}
        </button>
      </form>

      {error && <p className="error">Olana: {error}</p>}

      <h2>Rijam-panontaniana</h2>
      {loading ? (
        <p>Miandry kely...</p>
      ) : (
        <ul className="questionnaire-list">
          {questionnaires.map((q) => (
            <li key={q.id}>
              <div>
                <Link to={`/admin/questionnaires/${q.id}`}>
                  <strong>{q.title}</strong>
                </Link>
                <span> — fanontaniana {q.questions.length}</span>
                {!q.is_active && <span className="badge">tsy mavitrika</span>}
              </div>
              <button type="button" onClick={() => handleDelete(q.id)}>
                Fafao
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
