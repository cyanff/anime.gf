/*
  During development, you often have to run adhoc code snippets to test if things are working as expected.
  Put those code snippets here so that you could trigger them using ctrl+k.
*/

import { toProviderMessages } from "@/lib/context";
import { Message as DBMessage } from "@shared/db_types";

type Message = Pick<DBMessage, "id" | "sender" | "text">;
export function handleA() {
  // Test case 1: Empty messages array
  const messages1: Message[] = [];
  const latestUserMessage1 = "Hello";
  console.log("Test case 1: Empty messages array");
  console.log("Input:", { messages: messages1, latestUserMessage: latestUserMessage1 });
  console.log("Output:", toProviderMessages(messages1, latestUserMessage1));

  // Test case 2: Single user message
  const messages2: Message[] = [{ id: 1, sender: "user", text: "Hi there" }];
  const latestUserMessage2 = "How are you?";
  console.log("Test case 2: Single user message");
  console.log("Input:", { messages: messages2, latestUserMessage: latestUserMessage2 });
  console.log("Output:", toProviderMessages(messages2, latestUserMessage2));

  // Test case 3: Single assistant message
  const messages3: Message[] = [{ id: 1, sender: "character", text: "I'm doing well, thanks for asking!" }];
  const latestUserMessage3 = "That's great to hear!";
  console.log("Test case 3: Single assistant message");
  console.log("Input:", { messages: messages3, latestUserMessage: latestUserMessage3 });
  console.log("Output:", toProviderMessages(messages3, latestUserMessage3));

  // Test case 4: Alternating user and assistant messages
  const messages4: Message[] = [
    { id: 1, sender: "user", text: "Hello" },
    { id: 2, sender: "character", text: "Hi there! How can I assist you today?" },
    { id: 3, sender: "user", text: "I have a question about your products." }
  ];
  const latestUserMessage4 = "Can you provide more details about Product X?";
  console.log("Test case 4: Alternating user and assistant messages");
  console.log("Input:", { messages: messages4, latestUserMessage: latestUserMessage4 });
  console.log("Output:", toProviderMessages(messages4, latestUserMessage4));

  // Test case 5: Consecutive user messages
  const messages5: Message[] = [
    { id: 1, sender: "user", text: "I need help with my account." },
    { id: 2, sender: "user", text: "I can't seem to log in." },
    { id: 3, sender: "user", text: "I can't seem to log in." }
  ];
  const latestUserMessage5 = "Can you assist me with resetting my password?";
  console.log("Test case 5: Consecutive user messages");
  console.log("Input:", { messages: messages5, latestUserMessage: latestUserMessage5 });
  console.log("Output:", toProviderMessages(messages5, latestUserMessage5));

  // Test case 6: Consecutive assistant messages
  const messages6: Message[] = [
    { id: 1, sender: "character", text: "Hello! How can I help you today?" },
    { id: 2, sender: "character", text: "I'm sorry to hear that. Let me help you with that." },
    { id: 3, sender: "character", text: "Let me check that for you." }
  ];

  const latestUserMessage6 = "hiiii";
  console.log("Test case 6: Consecutive assistant messages");
  console.log("Input:", { messages: messages6, latestUserMessage: latestUserMessage6 });
  console.log("Output:", toProviderMessages(messages6, latestUserMessage6));
}

export async function handleB() {}

export function handleC() {}
