import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getQuestionnaire, listSubmissions } from "../../api/admin";
import { BarResultsChart } from "../../components/BarResultsChart";
import type {
  QuestionnaireWithQuestions,
  SubmissionWithAnswers,
} from "../../types/domain";
import "./results.css";

export function AdminQuestionnaireResultsPage() {
  const { id } = useParams<{ id: string }>();
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireWithQuestions | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionWithAnswers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([getQuestionnaire(id), listSubmissions()])
      .then(([q, s]) => {
        setQuestionnaire(q);
        setSubmissions(s);
        setSelectedQuestionIds(new Set(q.questions.map((question) => question.id)));
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur inconnue"))
      .finally(() => setLoading(false));
  }, [id]);

  function toggleQuestion(questionId: string) {
    setSelectedQuestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  }

  function selectAll() {
    if (!questionnaire) return;
    setSelectedQuestionIds(new Set(questionnaire.questions.map((q) => q.id)));
  }

  function selectNone() {
    setSelectedQuestionIds(new Set());
  }

  async function handleExportPdf() {
    if (!reportRef.current || !questionnaire) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: "#fcfcfb",
      });
      const imgData = canvas.toDataURL("image/jpeg", 0.92);

      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const filename = questionnaire.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      pdf.save(`resultats-${filename || "questionnaire"}.pdf`);
    } finally {
      setExporting(false);
    }
  }

  if (loading) return <div className="page">Chargement...</div>;
  if (error || !questionnaire) {
    return <div className="page error">Erreur: {error}</div>;
  }

  const relevantQuestionIds = new Set(questionnaire.questions.map((q) => q.id));
  const relevantSubmissions = submissions.filter((s) =>
    s.answers.some((a) => relevantQuestionIds.has(a.question_id))
  );
  const allAnswers = submissions.flatMap((s) => s.answers);

  return (
    <div className="page">
      <p className="back-link">
        <Link to={`/admin/questionnaires/${questionnaire.id}`}>&larr; Retour</Link>
      </p>

      <div className="results-actions">
        <button type="button" className="btn-primary" onClick={handleExportPdf} disabled={exporting}>
          {exporting ? "Export..." : "Exporter en PDF"}
        </button>
      </div>

      {questionnaire.questions.length > 0 && (
        <div className="chart-picker">
          <p className="chart-picker-title">Graphiques à afficher :</p>
          <div className="chart-picker-controls">
            <button type="button" className="btn-ghost" onClick={selectAll}>
              Tout sélectionner
            </button>
            <button type="button" className="btn-ghost" onClick={selectNone}>
              Tout désélectionner
            </button>
          </div>
          <div className="chart-picker-list">
            {questionnaire.questions.map((question) => (
              <label key={question.id} className="chart-picker-item">
                <input
                  type="checkbox"
                  checked={selectedQuestionIds.has(question.id)}
                  onChange={() => toggleQuestion(question.id)}
                />
                {question.libelle}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="results-page" ref={reportRef}>
        <h1>{questionnaire.title}</h1>
        <p className="results-summary">
          {relevantSubmissions.length} répondant{relevantSubmissions.length > 1 ? "s" : ""} au total
        </p>

        {questionnaire.questions.length === 0 ? (
          <p className="results-empty">Ce questionnaire n'a pas encore de questions.</p>
        ) : questionnaire.questions.filter((q) => selectedQuestionIds.has(q.id)).length === 0 ? (
          <p className="results-empty">Aucun graphique sélectionné.</p>
        ) : (
          questionnaire.questions
            .filter((question) => selectedQuestionIds.has(question.id))
            .map((question) => {
            const answersForQuestion = allAnswers.filter(
              (a) => a.question_id === question.id
            );
            const counts = new Map<string, number>(question.options.map((o) => [o, 0]));
            for (const answer of answersForQuestion) {
              const values = Array.isArray(answer.value) ? answer.value : [answer.value];
              for (const v of values) {
                counts.set(v, (counts.get(v) ?? 0) + 1);
              }
            }

            return (
              <BarResultsChart
                key={question.id}
                title={question.libelle}
                note={question.type === "checkbox" ? "plusieurs réponses possibles" : undefined}
                data={question.options.map((label) => ({
                  label,
                  count: counts.get(label) ?? 0,
                }))}
                totalRespondents={answersForQuestion.length}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
