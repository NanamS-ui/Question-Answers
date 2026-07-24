import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button
        type="button"
        className="btn-ghost"
        disabled={page === 0}
        onClick={() => onChange(page - 1)}
      >
        <ChevronLeft size={16} aria-hidden="true" />
        Précédent
      </button>
      <span className="pagination-info">
        Page {page + 1} / {totalPages}
      </span>
      <button
        type="button"
        className="btn-ghost"
        disabled={page >= totalPages - 1}
        onClick={() => onChange(page + 1)}
      >
        Suivant
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
