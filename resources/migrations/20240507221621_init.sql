-- init
begin transaction;
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
commit;
