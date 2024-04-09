-- TODO, implement soft delete for cards and personas
-- https://claude.ai/chat/35bc35a7-aa38-440a-938d-efd905feb08e
-- This is so that on deletion, the chat could still reference the persona and card


CREATE TABLE IF NOT EXISTS personas 
(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    inserted_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT
);

CREATE TABLE IF NOT EXISTS cards 
(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    -- The name of the card's zip archive (not including file extension)
    fileName TEXT NOT NULL,
    inserted_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT
);

CREATE TABLE IF NOT EXISTS chats 
(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    persona_id INTEGER NOT NULL,
    card_id INTEGER NOT NULL,
    inserted_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT,


    FOREIGN KEY(persona_id) REFERENCES personas(id),
    FOREIGN KEY(card_id) REFERENCES cards(id)
);

CREATE TABLE IF NOT EXISTS messages
(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id INTEGER NOT NULL,
    text TEXT,
    sender_type TEXT NOT NULL CHECK(sender_type IN ('user', 'character')),
    is_embedded BOOLEAN DEFAULT 0 NOT NULL,
    inserted_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT,
    FOREIGN KEY(chat_id) REFERENCES chats(id) ON DELETE CASCADE
);

-- TODO: Edit the avatar data to be a base64 image string
INSERT INTO personas (name, description)
VALUES
    ('cyan',  'Nobel laureate in Physics'),
    ('snafu', 'Nobel laureate in Chemistry');

INSERT INTO cards (fileName)
VALUES
    ('zephyr'),
    ('eliza'),
    ('astro'),
    ('zephyr'),
    ('eliza'),
    ('astro');

INSERT INTO chats (persona_id, card_id)
VALUES
    (1, 1),
    (2, 2),
    (2, 3);

INSERT INTO messages (chat_id, text, sender_type, is_embedded, inserted_at)
VALUES
(1, 'Hello!', 'character',  0, '2023-04-20 10:00:00'),
(1, 'hey, whats up?', 'user',  0, '2023-04-20 10:00:05'),
(1, 'nothing much, whats up with you?', 'character',  0, '2023-04-20 10:00:10'),
(1, 'none of your business', 'user',  0, '2023-04-20 10:00:15'),
(1, 'Hello, how can I assist you today?', 'character',  0, '2023-04-20 10:00:20'),
(2, 'Hi there! Let me know if you need any help.', 'character',  0, '2023-04-20 10:00:25'),
(3, 'hi', 'character',  0, '2023-04-20 10:00:25');