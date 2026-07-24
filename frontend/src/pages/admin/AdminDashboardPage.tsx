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
      setError(err instanceof Error ? err.message : "Erreur inconnue");
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
      setError(err instanceof Error ? err.message : "Erreur inconnue");
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
      <h1>Questionnaires</h1>

      <form onSubmit={handleCreate} className="card">
        <h2>Nouveau questionnaire</h2>
        <input
          type="text"
          placeholder="Titre"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={creating}
        />
        <textarea
          placeholder="Description (optionnel)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={creating}
        />
        <button type="submit" className="btn-primary" disabled={creating || !title.trim()}>
          {creating ? "Création..." : "Créer"}
        </button>
      </form>

      {error && <p className="error">Erreur : {error}</p>}

      <h2>Tous les questionnaires</h2>
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <ul className="questionnaire-list">
          {questionnaires.map((q) => (
            <li key={q.id} className="card">
              <div>
                <Link to={`/admin/questionnaires/${q.id}`}>
                  <strong>{q.title}</strong>
                </Link>
                <span className="submission-meta"> — {q.questions.length} question(s)</span>
                {!q.is_active && <span className="badge">inactif</span>}
              </div>
              <button type="button" className="btn-danger" onClick={() => handleDelete(q.id)}>
                Supprimer
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
