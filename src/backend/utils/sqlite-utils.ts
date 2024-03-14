import * as sqlite3 from "sqlite3";

let db;

/**
 * Initializes the database connection.
 */
export async function initializeDatabase() {
  db = new sqlite3.Database("./src/sqlite_storage/test.db", sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) console.error(err.message);
  });

  try {
    await createTable(
      "identities",
      `id INTEGER PRIMARY KEY AUTOINCREMENT,
         user_id INTEGER NOT NULL,
         inserted_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
         updated_at TEXT`
    );
    await createTable(
      "characters",
      `id INTEGER PRIMARY KEY AUTOINCREMENT,
         inserted_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
         updated_at TEXT`
    );
    await createTable(
      "chats",
      `id INTEGER PRIMARY KEY AUTOINCREMENT,
         inserted_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
         updated_at TEXT`
    );
    await createTable(
      "messages",
      `id INTEGER PRIMARY KEY AUTOINCREMENT,
         chat_id INTEGER NOT NULL,
         msg TEXT,
         sender_type TEXT NOT NULL,
         inserted_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
         updated_at TEXT,
         num_tokens INTEGER NOT NULL,
         embedded BOOLEAN DEFAULT 0 NOT NULL`
    );
  } catch (err) {
    console.error((err as Error).message);
  }
}

/**
 * Creates a table in the SQLite database.
 *
 * @param tableName - The name of the table to create.
 * @param columns - The columns of the table in the format "column1 datatype1, column2 datatype2, ...".
 * @returns A promise that resolves to `true` if the table is created successfully, or rejects with an error message if there is an error.
 */

function createTable(tableName: string, columns: string) {
  return new Promise((resolve, reject) => {
    const query = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns})`;
    db.run(query, (err) => {
      if (err) reject(err.message);
      resolve(true);
    });
  });
}
/**
 * Inserts data into a SQLite table.
 *
 * @param tableName - The name of the table to insert data into.
 * @param columns - The columns to insert data into.
 * @param values - The values to insert into the columns.
 * @returns A promise that resolves to true if the data is successfully inserted, or rejects with an error message if an error occurs.
 */
export function insertData(tableName: string, columns: string, values: any[]) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO ${tableName} (${columns}) VALUES(${values.map(() => "?").join(",")})`;
    db.run(sql, values, (err) => {
      if (err) reject(err.message);
      resolve(true);
    });
  });
}

/**
 * Updates data in a SQLite table.
 *
 * @param tableName - The name of the table to update.
 * @param column - The name of the column to update.
 * @param value - The new value for the column.
 * @param id - The ID of the row to update.
 * @returns A promise that resolves to `true` if the update is successful, or rejects with an error message if there is an error.
 */
export function updateData(tableName: string, column: string, value: any, id: number) {
  return new Promise((resolve, reject) => {
    const sql = `UPDATE ${tableName} SET ${column} = ? WHERE id = ?`;
    db.run(sql, [value, id], (err) => {
      if (err) reject(err.message);
      resolve(true);
    });
  });
}

/**
 * Deletes data from the specified table based on the provided ID.
 * @param tableName - The name of the table from which to delete the data.
 * @param id - The ID of the data to be deleted.
 * @returns A promise that resolves to true if the data is successfully deleted, or rejects with an error message if an error occurs.
 */
export function deleteData(tableName: string, id: number) {
  return new Promise((resolve, reject) => {
    const sql = `DELETE FROM ${tableName} WHERE id = ?`;
    db.run(sql, [id], (err) => {
      if (err) reject(err.message);
      resolve(true);
    });
  });
}

/**
 * Queries data from the specified table in the SQLite database.
 * @param tableName - The name of the table to query.
 * @returns A promise that resolves with the queried rows or rejects with an error message.
 */
export function queryData(tableName: string) {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM ${tableName}`;
    db.all(sql, [], (err, rows) => {
      if (err) reject(err.message);
      resolve(rows);
    });
  });
}

export function getLatestMessages(tokenLimit: number, chatId: number) {
  return new Promise((resolve, reject) => {
    const sql = `
        WITH Latest1kMessages AS (
          SELECT * FROM messages WHERE chat_id = ? ORDER BY id DESC LIMIT 1000
        ),
        MessagesWithRunningTotal AS (
          SELECT *, (SELECT SUM(token_count) FROM Latest1kMessages WHERE id <= m.id) AS running_total
          FROM Latest1kMessages m
        )
        SELECT l.chat_id, l.content, l.sender_type, l.inserted_at, l.updated_at, l.is_embedded, l.token_count, l.id
        FROM MessagesWithRunningTotal as l
        WHERE running_total < ?
      `;
    db.all(sql, [chatId, tokenLimit], (err, rows) => {
      if (err) reject(err.message);
      resolve(rows);
    });
  });
}

initializeDatabase();
