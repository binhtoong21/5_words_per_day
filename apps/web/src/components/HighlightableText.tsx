export function HighlightableText({ text, onHighlight }: { text: string, onHighlight: (word: string) => void }) {
  const handleMouseUp = () => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();
    if (selectedText && selectedText.length > 0 && selectedText.length < 50) {
      onHighlight(selectedText);
    }
  };

  return (
    <div 
      className="text-lg md:text-xl leading-loose text-slate-800 font-serif selection:bg-yellow-200 selection:text-slate-900"
      onMouseUp={handleMouseUp}
    >
      {text}
    </div>
  );
}
