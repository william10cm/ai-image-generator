import "./ImageDisplay.css";

interface ImageDisplayProps {
  imageUrl: string;
  isLoading: boolean;
}

// Shows the generated image, a loading message while waiting, or a
// placeholder hint before the user has generated anything.
function ImageDisplay({ imageUrl, isLoading }: ImageDisplayProps) {
  return (
    <div className="image-display">
      {isLoading && <p className="image-display__message">Generating your image...</p>}

      {!isLoading && imageUrl && (
        <img className="image-display__image" src={imageUrl} alt="AI generated result" />
      )}

      {!isLoading && !imageUrl && (
        <p className="image-display__message">
          Your generated image will appear here.
        </p>
      )}
    </div>
  );
}

export default ImageDisplay;
