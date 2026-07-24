import type { Question } from "../types/domain";

interface Props {
  question: Question;
  value: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
}

export function QuestionField({ question, value, onChange }: Props) {
  if (question.type === "radio") {
    return (
      <fieldset className="question-field">
        <legend>{question.libelle}</legend>
        {question.options.map((option) => (
          <label key={option} className="option-choice">
            <input
              type="radio"
              name={question.id}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
            />
            {option}
          </label>
        ))}
      </fieldset>
    );
  }

  if (question.type === "checkbox") {
    const selected = Array.isArray(value) ? value : [];
    return (
      <fieldset className="question-field">
        <legend>{question.libelle}</legend>
        {question.options.map((option) => (
          <label key={option} className="option-choice">
            <input
              type="checkbox"
              value={option}
              checked={selected.includes(option)}
              onChange={(e) =>
                onChange(
                  e.target.checked
                    ? [...selected, option]
                    : selected.filter((o) => o !== option)
                )
              }
            />
            {option}
          </label>
        ))}
      </fieldset>
    );
  }

  return (
    <div className="question-field">
      <label htmlFor={question.id}>{question.libelle}</label>
      <select
        id={question.id}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="" disabled>
          Choisir...
        </option>
        {question.options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
