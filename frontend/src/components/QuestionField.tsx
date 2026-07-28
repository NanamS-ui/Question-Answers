import type { Question } from "../types/domain";

interface Props {
  question: Question;
  value: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
  explanation: string | undefined;
  onExplanationChange: (explanation: string) => void;
}

function OtherInput({
  explanation,
  onExplanationChange,
}: Pick<Props, "explanation" | "onExplanationChange">) {
  return (
    <input
      type="text"
      className="option-other-input"
      placeholder="Lazao ny valin-teninao"
      aria-label="Lazao ny valin-teninao"
      value={explanation ?? ""}
      onChange={(e) => onExplanationChange(e.target.value)}
    />
  );
}

function ExplanationField({
  question,
  explanation,
  onExplanationChange,
}: Pick<Props, "question" | "explanation" | "onExplanationChange">) {
  if (!question.is_explanation) return null;
  return (
    <div className="explanation-field">
      <label htmlFor={`${question.id}-explanation`}>Azavao ny valinteninao </label>
      <textarea
        id={`${question.id}-explanation`}
        value={explanation ?? ""}
        onChange={(e) => onExplanationChange(e.target.value)}
      />
    </div>
  );
}

export function QuestionField({ question, value, onChange, explanation, onExplanationChange }: Props) {
  if (question.type === "radio") {
    return (
      <fieldset className="question-field">
        <legend>{question.libelle}</legend>
        {question.options.map((option) => (
          <div key={option.value} className="option-row">
            <label className="option-choice">
              <input
                type="radio"
                name={question.id}
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange(option.value)}
              />
              {option.value}
            </label>
            {option.is_other && value === option.value && (
              <OtherInput explanation={explanation} onExplanationChange={onExplanationChange} />
            )}
          </div>
        ))}
        <ExplanationField
          question={question}
          explanation={explanation}
          onExplanationChange={onExplanationChange}
        />
      </fieldset>
    );
  }

  if (question.type === "checkbox") {
    const selected = Array.isArray(value) ? value : [];
    return (
      <fieldset className="question-field">
        <legend>{question.libelle}</legend>
        {question.options.map((option) => (
          <div key={option.value} className="option-row">
            <label className="option-choice">
              <input
                type="checkbox"
                value={option.value}
                checked={selected.includes(option.value)}
                onChange={(e) =>
                  onChange(
                    e.target.checked
                      ? [...selected, option.value]
                      : selected.filter((o) => o !== option.value)
                  )
                }
              />
              {option.value}
            </label>
            {option.is_other && selected.includes(option.value) && (
              <OtherInput explanation={explanation} onExplanationChange={onExplanationChange} />
            )}
          </div>
        ))}
        <ExplanationField
          question={question}
          explanation={explanation}
          onExplanationChange={onExplanationChange}
        />
      </fieldset>
    );
  }

  const selectedOption = question.options.find((o) => o.value === value);
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
          <option key={option.value} value={option.value}>
            {option.value}
          </option>
        ))}
      </select>
      {selectedOption?.is_other && (
        <OtherInput explanation={explanation} onExplanationChange={onExplanationChange} />
      )}
      <ExplanationField
        question={question}
        explanation={explanation}
        onExplanationChange={onExplanationChange}
      />
    </div>
  );
}
