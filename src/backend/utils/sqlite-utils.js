"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestMessages = exports.queryData = exports.deleteData = exports.updateData = exports.insertData = exports.initializeDatabase = void 0;
var sqlite3 = require("sqlite3");
var db;
/**
 * Initializes the database connection.
 */
function initializeDatabase() {
    return __awaiter(this, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    db = new sqlite3.Database("./src/sqlite_storage/test.db", sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, function (err) {
                        if (err)
                            console.error(err.message);
                    });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, createTable("identities", "id INTEGER PRIMARY KEY AUTOINCREMENT,\n         user_id INTEGER NOT NULL,\n         inserted_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,\n         updated_at TEXT")];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, createTable("characters", "id INTEGER PRIMARY KEY AUTOINCREMENT,\n         inserted_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,\n         updated_at TEXT")];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, createTable("chats", "id INTEGER PRIMARY KEY AUTOINCREMENT,\n         inserted_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,\n         updated_at TEXT")];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, createTable("messages", "id INTEGER PRIMARY KEY AUTOINCREMENT,\n         chat_id INTEGER NOT NULL,\n         msg TEXT,\n         sender_type TEXT NOT NULL,\n         inserted_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,\n         updated_at TEXT,\n         num_tokens INTEGER NOT NULL,\n         embedded BOOLEAN DEFAULT 0 NOT NULL")];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 6:
                    err_1 = _a.sent();
                    console.error(err_1.message);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports.initializeDatabase = initializeDatabase;
/**
 * Creates a table in the SQLite database.
 *
 * @param tableName - The name of the table to create.
 * @param columns - The columns of the table in the format "column1 datatype1, column2 datatype2, ...".
 * @returns A promise that resolves to `true` if the table is created successfully, or rejects with an error message if there is an error.
 */
function createTable(tableName, columns) {
    return new Promise(function (resolve, reject) {
        var query = "CREATE TABLE IF NOT EXISTS ".concat(tableName, " (").concat(columns, ")");
        db.run(query, function (err) {
            if (err)
                reject(err.message);
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
function insertData(tableName, columns, values) {
    return new Promise(function (resolve, reject) {
        var sql = "INSERT INTO ".concat(tableName, " (").concat(columns, ") VALUES(").concat(values.map(function () { return "?"; }).join(","), ")");
        db.run(sql, values, function (err) {
            if (err)
                reject(err.message);
            resolve(true);
        });
    });
}
exports.insertData = insertData;
/**
 * Updates data in a SQLite table.
 *
 * @param tableName - The name of the table to update.
 * @param column - The name of the column to update.
 * @param value - The new value for the column.
 * @param id - The ID of the row to update.
 * @returns A promise that resolves to `true` if the update is successful, or rejects with an error message if there is an error.
 */
function updateData(tableName, column, value, id) {
    return new Promise(function (resolve, reject) {
        var sql = "UPDATE ".concat(tableName, " SET ").concat(column, " = ? WHERE id = ?");
        db.run(sql, [value, id], function (err) {
            if (err)
                reject(err.message);
            resolve(true);
        });
    });
}
exports.updateData = updateData;
/**
 * Deletes data from the specified table based on the provided ID.
 * @param tableName - The name of the table from which to delete the data.
 * @param id - The ID of the data to be deleted.
 * @returns A promise that resolves to true if the data is successfully deleted, or rejects with an error message if an error occurs.
 */
function deleteData(tableName, id) {
    return new Promise(function (resolve, reject) {
        var sql = "DELETE FROM ".concat(tableName, " WHERE id = ?");
        db.run(sql, [id], function (err) {
            if (err)
                reject(err.message);
            resolve(true);
        });
    });
}
exports.deleteData = deleteData;
/**
 * Queries data from the specified table in the SQLite database.
 * @param tableName - The name of the table to query.
 * @returns A promise that resolves with the queried rows or rejects with an error message.
 */
function queryData(tableName) {
    return new Promise(function (resolve, reject) {
        var sql = "SELECT * FROM ".concat(tableName);
        db.all(sql, [], function (err, rows) {
            if (err)
                reject(err.message);
            resolve(rows);
        });
    });
}
exports.queryData = queryData;
function getLatestMessages(tokenLimit, chatId) {
    return new Promise(function (resolve, reject) {
        var sql = "\n        WITH Latest1kMessages AS (\n          SELECT * FROM messages WHERE chat_id = ? ORDER BY id DESC LIMIT 1000\n        ),\n        MessagesWithRunningTotal AS (\n          SELECT *, (SELECT SUM(token_count) FROM Latest1kMessages WHERE id <= m.id) AS running_total\n          FROM Latest1kMessages m\n        )\n        SELECT l.chat_id, l.content, l.sender_type, l.inserted_at, l.updated_at, l.is_embedded, l.token_count, l.id\n        FROM MessagesWithRunningTotal as l\n        WHERE running_total < ?\n      ";
        db.all(sql, [chatId, tokenLimit], function (err, rows) {
            if (err)
                reject(err.message);
            resolve(rows);
        });
    });
}
exports.getLatestMessages = getLatestMessages;
initializeDatabase();
