CREATE TABLE IF NOT EXISTS personas 
(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    -- We should just store persona avatar as a base64 string *inside* the db
    -- Because there aren't many of them
    avatar TEXT,
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
    num_tokens INTEGER NOT NULL,
    is_embedded BOOLEAN DEFAULT 0 NOT NULL,
    inserted_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT,
    FOREIGN KEY(chat_id) REFERENCES chats(id)
);

-- TODO: Edit the avatar data to be a base64 image string
INSERT INTO personas (name, avatar, description)
VALUES
    ('John Doe', 'https://example.com/avatars/john.jpg', 'Nobel laureate in Physics'),
    ('Jane Smith', 'https://example.com/avatars/jane.jpg', 'Nobel laureate in Chemistry');

INSERT INTO cards (fileName)
VALUES
    ('zephyr'),
    ('eliza'),
    ('astro');

INSERT INTO chats (persona_id, card_id)
VALUES
    (1, 1),
    (2, 2),
    (2, 3);

INSERT INTO messages (chat_id, text, sender_type, num_tokens, is_embedded, inserted_at)
VALUES
(1, 'Hello!', 'character', 8, 0, '2023-04-20 10:00:00'),
(1, 'hey, whats up?', 'user', 8, 0, '2023-04-20 10:00:05'),
(1, 'nothing much, whats up with you?', 'character', 8, 0, '2023-04-20 10:00:10'),
(1, 'none of your business', 'user', 8, 0, '2023-04-20 10:00:15'),
(1, 'Hello, how can I assist you today?', 'character', 8, 0, '2023-04-20 10:00:20'),
(2, 'Hi there! Let me know if you need any help.', 'character', 12, 0, '2023-04-20 10:00:25'),
(3, 'hi', 'character', 12, 0, '2023-04-20 10:00:25');