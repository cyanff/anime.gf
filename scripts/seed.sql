CREATE TABLE IF NOT EXISTS personas 
(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    avatar TEXT,
    metadata TEXT,
    inserted_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT
);

CREATE TABLE IF NOT EXISTS characters 
(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card TEXT NOT NULL,
    inserted_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT
);

CREATE TABLE IF NOT EXISTS chats 
(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    persona_id INTEGER NOT NULL,
    character_id INTEGER NOT NULL,
    inserted_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT,
    FOREIGN KEY(persona_id) REFERENCES personas(id),
    FOREIGN KEY(character_id) REFERENCES characters(id)
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

INSERT INTO personas (name, avatar, metadata)
VALUES
    ('John Doe', 'https://example.com/avatars/john.jpg', '{"age": 30, "location": "New York"}'),
    ('Jane Smith', 'https://example.com/avatars/jane.jpg', '{"age": 25, "location": "London"}');

INSERT INTO characters  (card)
VALUES
    ('card1.png'),
    ('card2.png');

INSERT INTO chats (persona_id, character_id)
VALUES
    (1, 1),
    (1, 2),
    (2, 2);

INSERT INTO messages (chat_id, text, sender_type, num_tokens, is_embedded, inserted_at)
VALUES
(1, 'Hello!', 'character', 8, 0, '2023-04-20 10:00:00'),
(1, 'hey, whats up?', 'user', 8, 0, '2023-04-20 10:00:05'),
(1, 'nothing much, whats up with you?', 'character', 8, 0, '2023-04-20 10:00:10'),
(1, 'none of your business', 'user', 8, 0, '2023-04-20 10:00:15'),
(1, 'Hello, how can I assist you today?', 'character', 8, 0, '2023-04-20 10:00:20'),
(2, 'Hi there! Let me know if you need any help.', 'character', 12, 0, '2023-04-20 10:00:25'),
(3, 'Greetings! I''m here to provide information and answer your questions.', 'character', 14, 0, '2023-04-20 10:00:30');