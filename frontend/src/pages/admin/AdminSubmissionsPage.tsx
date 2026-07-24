import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listSubmissions } from "../../api/admin";
import type { SubmissionWithAnswers } from "../../types/domain";

function formatValue(value: string | string[]) {
  return Array.isArray(value) ? value.join(", ") : value;
}

export function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<SubmissionWithAnswers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listSubmissions()
      .then(setSubmissions)
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur inconnue"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <p className="back-link">
        <Link to="/admin">&larr; Retour</Link>
      </p>
      <h1>Réponses des utilisateurs</h1>

      {error && <p className="error">Erreur : {error}</p>}
      {loading ? (
        <p>Chargement...</p>
      ) : submissions.length === 0 ? (
        <p>Aucune réponse pour le moment.</p>
      ) : (
        <ul className="submission-list">
          {submissions.map((submission) => (
            <li key={submission.id} className="card">
              <div className="submission-header">
                <span className="avatar" aria-hidden="true">
                  {submission.prenom.charAt(0).toUpperCase()}
                </span>
                <div className="submission-header-text">
                  <strong>
                    {submission.prenom} {submission.nom}
                  </strong>
                  <span className="submission-meta">
                    {new Date(submission.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
              <ul>
                {submission.answers.map((answer) => (
                  <li key={answer.id}>
                    <em>{answer.questions?.libelle ?? answer.question_id}</em>:{" "}
                    {formatValue(answer.value)}
                  </li>
                ))}
              </ul>
              {submission.open_answer && (
                <p className="open-answer">
                  <em>Commentaire libre :</em> {submission.open_answer}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
