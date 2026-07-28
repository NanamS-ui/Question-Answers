import { AlertCircle, BarChart3, ClipboardList, Layers, Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createQuestionnaire, deleteQuestionnaire, listQuestionnaires } from "../../api/admin";
import type { QuestionnaireWithQuestions } from "../../types/domain";

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [questionnaires, setQuestionnaires] = useState<QuestionnaireWithQuestions[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  async function handleCreate() {
    setCreating(true);
    try {
      setError(null);
      const created = await createQuestionnaire({});
      navigate(`/admin/questionnaires/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setCreating(false);
    }
  }

  async function handleDelete(id: string, label: string) {
    if (!window.confirm(`Supprimer "${label}" ? Cette action est irréversible.`)) {
      return;
    }
    await deleteQuestionnaire(id);
    await refresh();
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Les questions</h1>
        <button type="button" className="btn-primary" onClick={handleCreate} disabled={creating}>
          {creating ? (
            <Loader2 size={18} className="icon-spin" aria-hidden="true" />
          ) : (
            <Plus size={18} aria-hidden="true" />
          )}
          Nouveau question
        </button>
      </div>

      {error && (
        <p className="error fade-in">
          <AlertCircle size={16} aria-hidden="true" />
          Erreur : {error}
        </p>
      )}

      {loading ? (
        <p className="loading-state">
          <Loader2 size={18} className="icon-spin" aria-hidden="true" />
          Chargement...
        </p>
      ) : questionnaires.length === 0 ? (
        <div className="empty-state">
          <Layers size={32} aria-hidden="true" />
          <p>Aucune question pour le moment.</p>
          <button type="button" className="btn-primary" onClick={handleCreate} disabled={creating}>
            {creating ? (
              <Loader2 size={18} className="icon-spin" aria-hidden="true" />
            ) : (
              <Plus size={18} aria-hidden="true" />
            )}
            Créer la première question
          </button>
        </div>
      ) : (
        <ul className="questionnaire-list">
          {questionnaires.map((q, index) => (
            <li key={q.id} className={`card fade-in-up delay-${Math.min(index, 5)}`}>
              <div>
                <Link to={`/admin/questionnaires/${q.id}`}>
                  <ClipboardList size={16} aria-hidden="true" />
                  <strong>Question {index + 1}</strong>
                </Link>
                <span className="submission-meta"> — {q.questions.length} question(s)</span>
                {!q.is_active && <span className="badge">inactif</span>}
                <p className="questionnaire-description">
                  {q.questions[0]?.libelle ?? "Aucune question ajoutée pour l'instant."}
                </p>
              </div>
              <div className="question-item-actions">
                <Link to={`/admin/questionnaires/${q.id}/results`} className="btn-ghost">
                  <BarChart3 size={16} aria-hidden="true" />
                  Voir résultats
                </Link>
                <button
                  type="button"
                  className="btn-danger"
                  onClick={() => handleDelete(q.id, `Question ${index + 1}`)}
                >
                  <Trash2 size={16} aria-hidden="true" />
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
