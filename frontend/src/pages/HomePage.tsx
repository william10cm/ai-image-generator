import { useState } from "react";
import PromptForm from "../components/PromptForm";
import ImageDisplay from "../components/ImageDisplay";
import { generateImage } from "../services/api";
import "./HomePage.css";

function HomePage() {
  // The text the user has typed into the prompt input
  const [prompt, setPrompt] = useState("");

  // The URL of the most recently generated image (empty until we have one)
  const [imageUrl, setImageUrl] = useState("");

  // Whether we're currently waiting on the AI API call
  const [isLoading, setIsLoading] = useState(false);

  // Error message to show the user, if the last generation attempt failed
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setImageUrl("");
    setError("");

    try {
      const url = await generateImage(prompt);
      setImageUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="home-page">
      <header className="home-page__header">
        <h1>AI Image Generator</h1>
        <p className="home-page__subtitle">
          Describe an image and let AI bring it to life.
        </p>
      </header>

      <main className="home-page__main">
        <PromptForm
          prompt={prompt}
          onPromptChange={setPrompt}
          onSubmit={handleGenerate}
          isLoading={isLoading}
        />
        {error && <p className="home-page__error">{error}</p>}
        <ImageDisplay imageUrl={imageUrl} isLoading={isLoading} />
      </main>
    </div>
  );
}

export default HomePage;
