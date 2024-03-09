-- Init
BEGIN TRANSACTION;

CREATE TABLE users
(
    id          INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    username    TEXT
);


CREATE TABLE chats
(
    id          INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    chat_id     TEXT NOT NULL,
    content     TEXT NOT NULL,
    timestamp   TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

COMMIT;