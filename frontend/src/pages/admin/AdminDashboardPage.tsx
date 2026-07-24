import { AlertCircle, ClipboardList, Layers, Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteQuestionnaire, listQuestionnaires } from "../../api/admin";
import type { QuestionnaireWithQuestions } from "../../types/domain";

export function AdminDashboardPage() {
  const [questionnaires, setQuestionnaires] = useState<QuestionnaireWithQuestions[]>([]);
  const [loading, setLoading] = useState(true);
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

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Supprimer le questionnaire "${title}" ? Cette action est irréversible.`)) {
      return;
    }
    await deleteQuestionnaire(id);
    await refresh();
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Questionnaires</h1>
        <Link to="/admin/new" className="btn-primary">
          <Plus size={18} aria-hidden="true" />
          Nouveau questionnaire
        </Link>
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
          <p>Aucun questionnaire pour le moment.</p>
          <Link to="/admin/new" className="btn-primary">
            <Plus size={18} aria-hidden="true" />
            Créer le premier questionnaire
          </Link>
        </div>
      ) : (
        <ul className="questionnaire-list">
          {questionnaires.map((q, index) => (
            <li key={q.id} className={`card fade-in-up delay-${Math.min(index, 5)}`}>
              <div>
                <Link to={`/admin/questionnaires/${q.id}`}>
                  <ClipboardList size={16} aria-hidden="true" />
                  <strong>{q.title}</strong>
                </Link>
                <span className="submission-meta"> — {q.questions.length} question(s)</span>
                {!q.is_active && <span className="badge">inactif</span>}
              </div>
              <button
                type="button"
                className="btn-danger"
                onClick={() => handleDelete(q.id, q.title)}
              >
                <Trash2 size={16} aria-hidden="true" />
                Supprimer
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
