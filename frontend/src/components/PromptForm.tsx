import "./PromptForm.css";

// Props this component receives from its parent (App).
// Defining the shape of props with an interface is a common TypeScript +
// React pattern - it gives us autocomplete and catches typos at compile time.
interface PromptFormProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

function PromptForm({
  prompt,
  onPromptChange,
  onSubmit,
  isLoading,
}: PromptFormProps) {
  // Prevent the default full-page reload that <form> does on submit,
  // then hand control back to the parent component.
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form className="prompt-form" onSubmit={handleSubmit}>
      <label htmlFor="prompt-input" className="prompt-form__label">
        Describe the image you want to create
      </label>
      <div className="prompt-form__row">
        <input
          id="prompt-input"
          type="text"
          className="prompt-form__input"
          placeholder="e.g. A watercolor painting of a fox in a forest"
          value={prompt}
          onChange={(event) => onPromptChange(event.target.value)}
          disabled={isLoading}
        />
        <button
          type="submit"
          className="prompt-form__button"
          disabled={isLoading || !prompt.trim()}
        >
          {isLoading ? (
            <>
              <span className="spinner" aria-hidden="true" /> Generating...
            </>
          ) : (
            "Generate"
          )}
        </button>
      </div>
    </form>
  );
}

export default PromptForm;
