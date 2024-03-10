import { UIMessage } from "@/lib/types";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Message from "@/components/Message";
import time from "@/lib/time";

enum ScrollEvent {
  FETCH_MORE_MESSAGES,
  NEW_USER_MESSAGE,
  NEW_COMPANION_MESSAGE
}

interface MessageAreaProps {
  msgProp: UIMessage[];
}

export default function MessagesArea({ msgProp }: MessageAreaProps) {
  const [msgs, setMsgs] = useState(msgProp);
  const scrollHeightRef = useRef(0);
  const scrollBoxRef = useRef<HTMLDivElement | null>(null);
  const scrollEventRef = useRef<ScrollEvent | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // This is garbage, will refactor later
  useLayoutEffect(() => {
    const scrollBox = scrollBoxRef.current!;
    const oldScrollHeight = scrollHeightRef.current;
    const newScrollHeight = scrollBox.scrollHeight;
    switch (scrollEventRef.current) {
      case ScrollEvent.FETCH_MORE_MESSAGES:
        const scrollDelta = newScrollHeight - oldScrollHeight;
        scrollBox.scrollTop = scrollDelta;
        break;
      case ScrollEvent.NEW_COMPANION_MESSAGE:
        if (oldScrollHeight - scrollBox.scrollTop - scrollBox.clientHeight < 200) {
          scrollToEnd();
        }
        break;
      case ScrollEvent.NEW_USER_MESSAGE:
        scrollToEnd();
        break;
      default:
        break;
    }
  }, [msgs]);

  // Scroll to bottom on load
  useEffect(() => {
    scrollToEnd();
  }, []);

  // Scroll handler, load more messages when user scrolls to the top
  function doScroll(e: React.UIEvent<HTMLDivElement, UIEvent>) {
    const scrollBox = e.currentTarget;
    const firstMessage = scrollBox.firstChild as HTMLElement | null;

    // Get message id to fetch starting from

    if (scrollBox.scrollTop == 0) {
      // Store the current scroll height before loading more messages
      // We use this to restore the scroll position after loading more messages
      // This is needed to prevent the scroll box from "jumping" to the top of the new messages
      scrollHeightRef.current = scrollBox.scrollHeight;
      scrollEventRef.current = ScrollEvent.FETCH_MORE_MESSAGES;

      // Fetch more messages and prepend to the message state
    }
  }

  function scrollToEnd() {
    const messagesEnd = messagesEndRef.current!;
    messagesEnd.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  return (
    <div className="mb-4 flex h-full flex-col overflow-x-auto rounded-lg  bg-[#222222] p-4">
      <div
        ref={scrollBoxRef}
        onScroll={doScroll}
        className="flex h-full flex-col space-y-4 overflow-auto scrollbar-track-neutral-600 scrollbar-thumb-neutral-400"
      >
        {msgs.map((msg, idx) => {
          const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          const humanReadableTimestamp = time.isoToUserRelativeTime(msg.timestamp, userTimezone);
          return (
            <Message
              key={idx}
              data-msg-id={msg.id}
              avatarURL={msg.avatar}
              username={msg.name}
              timestamp={humanReadableTimestamp}
              content={msg.content || ""}
            />
          );
        })}
        <div ref={messagesEndRef} className="invisible -mt-4 h-0" />
      </div>
    </div>
  );
}
