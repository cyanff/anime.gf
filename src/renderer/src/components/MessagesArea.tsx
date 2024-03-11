import { UIMessage as UIMSG } from "@/lib/types";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Message from "@/components/Message";
import time from "@/lib/time";

enum ScrollEvent {
  FETCH,
  USER,
  CHARACTER
}

interface Props {
  msgProp: UIMSG[];
}

export default function MessagesArea({ msgProp }: Props) {
  const [msgs, setMsgs] = useState(msgProp);

  // ================ Scroll management ================
  const hRef = useRef(0);
  const endRef = useRef<HTMLDivElement | null>(null);
  const scrollBoxRef = useRef<HTMLDivElement | null>(null);
  const scrollEventRef = useRef<ScrollEvent | null>(null);

  useLayoutEffect(() => {
    const scrollBox = scrollBoxRef.current!;
    const oldH = hRef.current;
    const newH = scrollBox.scrollHeight;

    switch (scrollEventRef.current) {
      case ScrollEvent.FETCH:
        const scrollDelta = newH - oldH;
        scrollBox.scrollTop = scrollDelta;
        break;
      case ScrollEvent.CHARACTER:
        // If the scroll was near the bottom, scroll to the bottom
        if (oldH - scrollBox.scrollTop - scrollBox.clientHeight < 200) {
          scrollToEnd();
        }
        break;
      case ScrollEvent.USER:
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

  function setScrollMarker(height: number, event: ScrollEvent) {
    hRef.current = height;
    scrollEventRef.current = event;
  }

  function scrollToEnd() {
    const messagesEnd = endRef.current!;
    messagesEnd.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  // Load more messages when user scrolls to the top
  function doScroll(e: React.UIEvent<HTMLDivElement, UIEvent>) {
    const scrollBox = e.currentTarget;
    const firstMSG = scrollBox.firstChild as HTMLElement | null;
    const id = firstMSG?.getAttribute("data-msg-id");
    if (scrollBox.scrollTop == 0) {
      setScrollMarker(scrollBox.scrollHeight, ScrollEvent.FETCH);
      // Fetch more messages and prepend to the message state
    }
  }

  return (
    <div className="mb-4 flex h-full flex-col overflow-x-auto rounded-lg  p-4">
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
        <div ref={endRef} className="invisible -mt-4 h-0" />
      </div>
    </div>
  );
}
