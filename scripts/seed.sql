CREATE TABLE IF NOT EXISTS personas 
(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    avatar TEXT NOT NULL,
    metadata TEXT,
    inserted_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT
);

CREATE TABLE IF NOT EXISTS characters 
(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card TEXT NOT NULL,
    hash TEXT NOT NULL,
    inserted_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT
);

CREATE TABLE IF NOT EXISTS chats 
(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    persona_id INTEGER,
    character_id INTEGER,
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

INSERT INTO characters  (card, hash)
VALUES
    ('card1.png', '1'),
    ('card2.png', '2'),
    ('card3.png', '3');

INSERT INTO chats (persona_id, character_id)
VALUES
    (1, 1),
    (1, 2),
    (2, 3);

INSERT INTO messages (chat_id, text, sender_type, num_tokens, is_embedded)
VALUES
    (1, 'Hello!', 'character',  8, 0),
    (1, 'hey, whats up?', 'user',  8, 0),
    (1, 'nothing much, whats up with you?', 'character',  8, 0),
    (1, 'none of your business', 'user',  8, 0),
    (1, 'Hello, how can I assist you today?', 'character',  8, 0),
    (2, 'Hi there! Let me know if you need any help.', 'character', 12, 0),
    (3, 'Greetings! I''m here to provide information and answer your questions.', 'character',  14, 0);

