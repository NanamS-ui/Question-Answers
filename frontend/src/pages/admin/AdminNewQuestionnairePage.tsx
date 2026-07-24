import { AlertCircle, ArrowLeft, ClipboardPlus, Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createQuestionnaire } from "../../api/admin";

export function AdminNewQuestionnairePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    try {
      setError(null);
      const created = await createQuestionnaire({ title, description: description || undefined });
      navigate(`/admin/questionnaires/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setCreating(false);
    }
  }

  return (
    <div className="page">
      <p className="back-link">
        <Link to="/admin">
          <ArrowLeft size={16} aria-hidden="true" /> Retour
        </Link>
      </p>
      <h1>Nouveau questionnaire</h1>
      <p className="questionnaire-description">
        Donne-lui un titre, tu pourras ajouter les questions juste après.
      </p>

      <form onSubmit={handleCreate} className="card fade-in-up">
        <input
          type="text"
          placeholder="Titre"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={creating}
          autoFocus
        />
        <textarea
          placeholder="Description (optionnel)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={creating}
        />

        {error && (
          <p className="error fade-in">
            <AlertCircle size={16} aria-hidden="true" />
            Erreur : {error}
          </p>
        )}

        <button type="submit" className="btn-primary btn-lg" disabled={creating || !title.trim()}>
          {creating ? (
            <>
              <Loader2 size={18} className="icon-spin" aria-hidden="true" />
              Création...
            </>
          ) : (
            <>
              <ClipboardPlus size={18} aria-hidden="true" />
              Créer le questionnaire
            </>
          )}
        </button>
      </form>
    </div>
  );
}
