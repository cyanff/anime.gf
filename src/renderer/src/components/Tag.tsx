interface TagProps {
  text: string;
}

export default function Tag({ text }: TagProps) {
  if (text.trim() === "") {
    return null;
  }

  return (
    <span
      className="text-shadow inline-block whitespace-nowrap rounded-full
    bg-gradient-to-br from-neutral-600 to-neutral-700 px-2 py-1.5 text-xs
    font-medium text-neutral-200 shadow"
    >
      {text}
    </span>
  );
}
