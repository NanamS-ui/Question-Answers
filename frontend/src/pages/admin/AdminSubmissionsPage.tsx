import { ArrowLeft, Inbox, Loader2, MessageCircle, Search, SearchX } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listQuestionnaires, listSubmissions } from "../../api/admin";
import { Pagination } from "../../components/Pagination";
import type { QuestionnaireWithQuestions, SubmissionWithAnswers } from "../../types/domain";

const PAGE_SIZE = 10;

function formatValue(value: string | string[] | undefined) {
  if (value === undefined) return "—";
  return Array.isArray(value) ? value.join(", ") : value;
}

export function AdminSubmissionsPage() {
  const [questionnaires, setQuestionnaires] = useState<QuestionnaireWithQuestions[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionWithAnswers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [pageByKey, setPageByKey] = useState<Record<string, number>>({});

  useEffect(() => {
    Promise.all([listQuestionnaires(), listSubmissions()])
      .then(([q, s]) => {
        setQuestionnaires(q);
        setSubmissions(s);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur inconnue"))
      .finally(() => setLoading(false));
  }, []);

  function getPage(key: string, totalPages: number) {
    return Math.min(pageByKey[key] ?? 0, Math.max(totalPages - 1, 0));
  }

  function setPage(key: string, page: number) {
    setPageByKey((prev) => ({ ...prev, [key]: page }));
  }

  const normalizedSearch = search.trim().toLowerCase();
  const matchesSearch = (s: SubmissionWithAnswers) =>
    !normalizedSearch || `${s.prenom} ${s.nom}`.toLowerCase().includes(normalizedSearch);

  const commentedSubmissions = submissions.filter((s) => s.open_answer?.trim() && matchesSearch(s));
  const hasAnyData = submissions.length > 0;

  const tables = questionnaires
    .filter((q) => q.questions.length > 0)
    .map((questionnaire) => {
      const questionIds = new Set(questionnaire.questions.map((q) => q.id));
      const relevantSubmissions = submissions.filter(
        (s) => s.answers.some((a) => questionIds.has(a.question_id)) && matchesSearch(s)
      );
      return { questionnaire, relevantSubmissions };
    })
    .filter((t) => t.relevantSubmissions.length > 0);

  const noSearchResults =
    hasAnyData && normalizedSearch && tables.length === 0 && commentedSubmissions.length === 0;

  return (
    <div className="page page-wide">
      <p className="back-link">
        <Link to="/admin">
          <ArrowLeft size={16} aria-hidden="true" /> Retour
        </Link>
      </p>
      <h1>Réponses des utilisateurs</h1>

      {hasAnyData && (
        <div className="search-bar">
          <Search size={18} aria-hidden="true" />
          <input
            type="text"
            placeholder="Rechercher un répondant (nom, prénom)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {error && <p className="error">Erreur : {error}</p>}
      {loading ? (
        <p className="loading-state">
          <Loader2 size={18} className="icon-spin" aria-hidden="true" />
          Chargement...
        </p>
      ) : !hasAnyData ? (
        <div className="empty-state">
          <Inbox size={32} aria-hidden="true" />
          <p>Aucune réponse pour le moment.</p>
        </div>
      ) : noSearchResults ? (
        <div className="empty-state">
          <SearchX size={32} aria-hidden="true" />
          <p>Aucun répondant ne correspond à "{search}".</p>
        </div>
      ) : (
        <>
          {tables.map(({ questionnaire, relevantSubmissions }, index) => {
            const totalPages = Math.ceil(relevantSubmissions.length / PAGE_SIZE);
            const page = getPage(questionnaire.id, totalPages);
            const pageRows = relevantSubmissions.slice(
              page * PAGE_SIZE,
              page * PAGE_SIZE + PAGE_SIZE
            );

            return (
              <section key={questionnaire.id} className="table-section">
                <h2>Question {index + 1}</h2>
                <p className="submission-meta">
                  {relevantSubmissions.length} réponse{relevantSubmissions.length > 1 ? "s" : ""}
                </p>
                <div className="card table-card">
                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Répondant</th>
                          <th>Date</th>
                          {questionnaire.questions.map((q) => (
                            <th key={q.id}>{q.libelle}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {pageRows.map((submission) => (
                          <tr key={submission.id}>
                            <td>
                              <div className="respondent-cell">
                                <span className="avatar" aria-hidden="true">
                                  {submission.prenom.charAt(0).toUpperCase()}
                                </span>
                                {submission.prenom} {submission.nom}
                              </div>
                            </td>
                            <td>{new Date(submission.created_at).toLocaleString()}</td>
                            {questionnaire.questions.map((q) => {
                              const answer = submission.answers.find((a) => a.question_id === q.id);
                              return (
                                <td key={q.id}>
                                  {formatValue(answer?.value)}
                                  {answer?.explanation && (
                                    <div className="answer-explanation">{answer.explanation}</div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onChange={(p) => setPage(questionnaire.id, p)}
                />
              </section>
            );
          })}

          {commentedSubmissions.length > 0 &&
            (() => {
              const totalPages = Math.ceil(commentedSubmissions.length / PAGE_SIZE);
              const page = getPage("comments", totalPages);
              const pageRows = commentedSubmissions.slice(
                page * PAGE_SIZE,
                page * PAGE_SIZE + PAGE_SIZE
              );

              return (
                <section className="table-section">
                  <h2>
                    <MessageCircle size={18} aria-hidden="true" /> Commentaires libres
                  </h2>
                  <p className="submission-meta">
                    {commentedSubmissions.length} commentaire{commentedSubmissions.length > 1 ? "s" : ""}
                  </p>
                  <div className="card table-card">
                    <div className="table-wrapper">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Répondant</th>
                            <th>Date</th>
                            <th>Commentaire</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pageRows.map((submission) => (
                            <tr key={submission.id}>
                              <td>
                                <div className="respondent-cell">
                                  <span className="avatar" aria-hidden="true">
                                    {submission.prenom.charAt(0).toUpperCase()}
                                  </span>
                                  {submission.prenom} {submission.nom}
                                </div>
                              </td>
                              <td>{new Date(submission.created_at).toLocaleString()}</td>
                              <td>{submission.open_answer}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    onChange={(p) => setPage("comments", p)}
                  />
                </section>
              );
            })()}
        </>
      )}
    </div>
  );
}
