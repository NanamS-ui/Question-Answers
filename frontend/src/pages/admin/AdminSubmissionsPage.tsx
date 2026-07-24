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
      .catch((err) => setError(err instanceof Error ? err.message : "Olana tsy fantatra"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <p>
        <Link to="/admin">&larr; Miverina</Link>
      </p>
      <h1>Valin-tenin'ny mpampiasa</h1>

      {error && <p className="error">Olana: {error}</p>}
      {loading ? (
        <p>Miandry kely...</p>
      ) : submissions.length === 0 ? (
        <p>Mbola tsy misy valiny amin'izao fotoana izao.</p>
      ) : (
        <ul className="submission-list">
          {submissions.map((submission) => (
            <li key={submission.id}>
              <div className="submission-header">
                <strong>
                  {submission.prenom} {submission.nom}
                </strong>
                <span> — {new Date(submission.created_at).toLocaleString()}</span>
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
                  <em>Hevitra na fanamarihana hafa :</em> {submission.open_answer}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
