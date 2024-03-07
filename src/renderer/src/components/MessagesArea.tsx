"use client";

import { UIMessage } from "@/lib/types";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Message from "@/components/Message";
import time from "@/lib/time";

enum ScrollEvent {
  FETCH_MORE_MESSAGES,
  NEW_USER_MESSAGE,
  NEW_COMPANION_MESSAGE
}

export default function MessagesArea(messages: UIMessage[]) {
  const [uiMessages, setUIMessages] = useState(messages);
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
          scrollToMessagesEnd();
        }
        break;
      case ScrollEvent.NEW_USER_MESSAGE:
        scrollToMessagesEnd();
        break;
      default:
        break;
    }
  }, [uiMessages]);

  // Scroll to bottom on load
  useEffect(() => {
    scrollToMessagesEnd();
  }, []);

  // Scroll handler, load more messages when user scrolls to the top
  function doInfiniteScroll(e: React.UIEvent<HTMLDivElement, UIEvent>) {
    const scrollBox = e.currentTarget;
    const firstMessage = scrollBox.firstChild as HTMLElement | null;
    // Get the attribute "data-msg-id" from the first message
    // We fetch more messages that are older than the message with this id
    const fromID = firstMessage?.dataset.msgId || "";

    if (scrollBox.scrollTop == 0) {
      // Store the current scroll height before loading more messages
      // We use this to restore the scroll position after loading more messages
      // This is needed to prevent the scroll box from "jumping" to the top of the new messages
      scrollHeightRef.current = scrollBox.scrollHeight;
      scrollEventRef.current = ScrollEvent.FETCH_MORE_MESSAGES;

      // Fetch more messages and prepend to the message state
    }
  }

  function scrollToMessagesEnd() {
    const messagesEnd = messagesEndRef.current!;
    messagesEnd.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  return (
    <div className="mb-4 flex h-full flex-col overflow-x-auto rounded-lg  bg-[#222222] p-4">
      <div
        ref={scrollBoxRef}
        onScroll={doInfiniteScroll}
        className="flex h-full flex-col space-y-4 overflow-auto scrollbar-track-neutral-600 scrollbar-thumb-neutral-400"
      >
        {/* Render messages component */}
        {uiMessages.map((message, index) => {
          const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          const humanReadableTimestamp = time.isoToUserRelativeTime(message.timestamp, userTimezone);

          return (
            <Message
              key={index}
              data-msg-id={message.id}
              avatarURL={message.avatarURL}
              username={message.username}
              timestamp={humanReadableTimestamp}
              content={message.content || ""}
            />
          );
        })}
        <div ref={messagesEndRef} className="invisible -mt-4 h-0" />
      </div>
    </div>
  );
}
