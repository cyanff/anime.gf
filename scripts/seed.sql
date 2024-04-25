CREATE TABLE IF NOT EXISTS personas 
(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT DEFAULT "" NOT NULL,
    -- The name of the personas directory
    -- Should be name-uuidv4
    -- The name should be lowercased, with spaces replaced with hyphens
    -- Ex: cyan-ea483976-e42c-42bb-9918-6314abc30b18
    dir_name TEXT NOT NULL,
    is_deleted BOOLEAN DEFAULT 0 NOT NULL,
    is_default BOOLEAN DEFAULT 0 NOT NULL,
    inserted_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT
);

CREATE TABLE IF NOT EXISTS cards 
(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    -- The name of the card directory
    -- Should be characterName-sha256
    -- The characterName should be lowercased, with spaces replaced with hyphens
    -- Ex: zephyr-ea483976-e42c-42bb-9918-6314abc30b18
    dir_name TEXT NOT NULL,
    is_deleted BOOLEAN DEFAULT 0 NOT NULL,
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
    FOREIGN KEY(card_id) REFERENCES cards(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS message_candidates
(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id INTEGER NOT NULL,
    text TEXT DEFAULT "" NOT NULL ,
    inserted_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT,
    FOREIGN KEY(message_id) REFERENCES messages(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages
(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id INTEGER NOT NULL,
    text TEXT DEFAULT "" NOT NULL ,
    sender TEXT NOT NULL CHECK(sender IN ('user', 'character')),
    is_embedded BOOLEAN DEFAULT 0 NOT NULL,
    prime_candidate_id INTEGER,
    inserted_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT,
    FOREIGN KEY(chat_id) REFERENCES chats(id) ON DELETE CASCADE,
    FOREIGN KEY (prime_candidate_id) REFERENCES message_candidates (id)
);

INSERT INTO personas (name, dir_name, description,  is_default)
VALUES
    ('cyan', 'cyan',  'Nobel laureate in Physics', 1),
    ('snafu', 'snafu', 'Nobel laureate in Chemistry', 0);

INSERT INTO cards (dir_name)
VALUES
    ('zephyr'),
    ('eliza'),
    ('astro'),
    ('mai'),
    ('lucy'),
    ('yuno'),
    ('miku'),
    ('kurisu'),
    ('rias');


INSERT INTO chats (persona_id, card_id)
VALUES
    (1, 1),
    (2, 2),
    (2, 3);

INSERT INTO messages (chat_id, text, sender, inserted_at)
VALUES
(1, 'Hello!', 'character',   '2023-04-20 10:00:00'),
(1, 'hey, whats up?', 'user',   '2023-04-20 10:00:05'),
(1, 'nothing much, whats up with you?', 'character',   '2023-04-20 10:00:10'),
(1, 'none of your business', 'user',   '2023-04-20 10:00:15'),
(1, 'hello, how can i assist you today?', 'character',   '2023-04-20 10:00:20'),
(1, 'hello, how can i assist you today?', 'character',   '2023-04-20 10:00:20'),
(1, 'Hello, how can I assist you today?', 'character',   '2023-04-20 10:00:20'),
(1, 'Hello, how can I assist you today?', 'character',   '2023-04-20 10:00:20'),
(1, 'Hello, how can I assist you today?', 'character',   '2023-04-20 10:00:20'),
(1, 'Hello, how can I assist you today?', 'character',   '2023-04-20 10:00:20'),
(1, 'Hello, how can I assist you today?', 'character',   '2023-04-20 10:00:20'),
(1, 'Hello, how can I assist you today?', 'character',   '2023-04-20 10:00:20'),
(1, 'Hello, how can I assist you today?', 'character',   '2023-04-20 10:00:20'),
(1, 'Hello, how can I assist you today?', 'character',   '2023-04-20 10:00:20'),
(1, 'Hello, how can I assist you today?', 'character',   '2023-04-20 10:00:20'),
(1, 'Hello, how can I assist you today?', 'character',   '2023-04-20 10:00:20'),
(1, 'Hello, how can I assist you today?', 'character',   '2023-04-20 10:00:20'),
(1, 'Hello, how can I assist you today?', 'character',   '2023-04-20 10:00:20'),
(1, 'Hello, how can I assist you today?', 'character',   '2023-04-20 10:00:20'),
(1, 'Hello, how can I assist you today?', 'character',   '2023-04-20 10:00:20'),
(1, 'Hello, how can I assist you today?', 'character',   '2023-04-20 10:00:20'),
(1, 'Hello, how can I assist you today?', 'character',   '2023-04-20 10:00:20'),
(1, 'Hello, how can I assist you today?', 'character',   '2023-04-20 10:00:20'),
(1, 'Hello, how can I assist you today?', 'character',   '2023-04-20 10:00:20'),
(1, 'Hello, how can I assist you today?', 'character',   '2023-04-20 10:00:20'),
(1, 'Hello, how can I assist you today?', 'character',   '2023-04-20 10:00:20'),
(1, 'Hello, how can I assist you today?', 'character',   '2023-04-20 10:00:20'),
(1, 'Hello, how can I assist you today?', 'character',   '2023-04-20 10:00:20'),
(1, 'Hello, how can I assist you today?', 'character',   '2023-04-20 10:00:20'),
(1, 'Hello, how can I assist you today?', 'character',   '2023-04-20 10:00:20'),
(1, 'Hello, how can I assist you today?', 'character',   '2023-04-20 10:00:20'),
(1, 'Hello, how can I assist you today?', 'character',   '2023-04-20 10:00:20'),
(1, 'Hello, how can I assist you today?', 'character',   '2023-04-20 10:00:20'),
(1, 'Hello, how can I assist you today?', 'character',   '2023-04-20 10:00:20'),
(1, 'Hello, how can I assist you today?', 'character',   '2023-04-20 10:00:20'),
(1, 'Hello, how can I assist you today?', 'character',   '2023-04-20 10:00:20'),
(1, 'Hello, how can I assist you today?', 'character',   '2023-04-20 10:00:20'),
(1, 'Hello, how can I assist you today?', 'character',   '2023-04-20 10:00:20'),
(1, 'hello, how can i assist you today?', 'character',   '2023-04-20 10:00:20'),
(1, 'hello, how can i assist you today?', 'character',   '2023-04-20 10:00:20'),
(1, 'hello, how can i assist you today?', 'character',   '2023-04-20 10:00:20'),
(1, 'hello, how can i assist you today?', 'character',   '2023-04-20 10:00:20'),
(1, 'hello, how can i assist you today?', 'character',   '2023-04-20 10:00:20'),
(1, 'hello, how can i assist you today?', 'character',   '2023-04-20 10:00:20'),
(2, 'Hi there! Let me know if you need any help.', 'character',   '2023-04-20 10:00:25'),
(3, 'hi', 'character',   '2023-04-20 10:00:25'),
(3, '**bold** *italics* normal "quotes"', 'user',   '2023-04-20 10:00:25');


INSERT INTO message_candidates (message_id, text)
VALUES
(5, 'hi how might i help you td?'),
(5, 'heyyyyy how might i help?'),
(5, 'i am here to help you today, how might i assist you'),
(5, 'i am here to help'),
(5, 'i am here to help you personally'),
(5, 'i am in your walls (the one to the left)');

