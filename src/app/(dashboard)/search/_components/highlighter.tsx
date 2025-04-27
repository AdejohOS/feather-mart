interface HighlighterProps {
  text: string;
  highlight: string;
}

export function Highlighter({ text, highlight }: HighlighterProps) {
  if (!highlight.trim()) {
    return <>{text}</>;
  }

  const regex = new RegExp(
    `(${highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi"
  );
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="bg-yellow-100 font-medium">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
}
