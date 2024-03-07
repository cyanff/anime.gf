import styles from "../styles/Typing.module.css";
import { cn } from "@/lib/utils";

interface TypingProps {
  className?: string;
  name: string;
  typing: boolean;
}

export default function Typing({ className, name, typing }: TypingProps) {
  return (
    <div className={cn(`flex items-center space-x-2 ${typing ? "visible" : "invisible"}`, className)}>
      <div>
        <div className={styles.typing__dot}></div>
        <div className={styles.typing__dot}></div>
        <div className={styles.typing__dot}></div>
      </div>
      <p className="text-[0.9rem]">
        <b>{name}</b> is typing
      </p>
    </div>
  );
}
