// Accès MySQL (mysql2/promise). Configuration par DATABASE_URL ou DB_HOST / DB_PORT / DB_USER / DB_PASSWORD / DB_NAME.
// Les dates sont stockées en UTC (session time_zone = +00:00) et relues sous forme de chaînes « AAAA-MM-JJ HH:MM:SS ».
const mysql = require('mysql2/promise');

const common = { charset: 'utf8mb4', timezone: 'Z', dateStrings: true, waitForConnections: true, connectionLimit: Number(process.env.DB_POOL_SIZE) || 10 };
const config = process.env.DATABASE_URL
  ? { uri: process.env.DATABASE_URL, ...common }
  : {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'terranova',
    ...common,
  };

const pool = mysql.createPool(config);
pool.on('connection', (conn) => conn.query("SET time_zone = '+00:00'"));

const all = async (sql, params = []) => (await pool.query(sql, params))[0];
const get = async (sql, params = []) => (await all(sql, params))[0];
const run = async (sql, params = []) => {
  const [r] = await pool.query(sql, params);
  return { insertId: r.insertId, changes: r.affectedRows };
};

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(191) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('citoyen','agent','admin') NOT NULL DEFAULT 'citoyen',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    token CHAR(64) PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    expires_at BIGINT NOT NULL,
    INDEX idx_sessions_user (user_id),
    CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,
  // Demandes reçues de l'API Webcup, dédoublonnées sur request_code
  `CREATE TABLE IF NOT EXISTS api_requests (
    request_code VARCHAR(64) PRIMARY KEY,
    payload MEDIUMTEXT NOT NULL,
    difficulty_level INT NULL,
    xp_total INT NULL,
    wave INT NULL,
    first_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    done TINYINT(1) NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS api_state (
    id TINYINT UNSIGNED PRIMARY KEY,
    session_json TEXT NULL,
    last_poll_at DATETIME NULL,
    last_error TEXT NULL
  )`,
  // Journal de veille : chaque nouveauté détectée dans les données de l'API
  `CREATE TABLE IF NOT EXISTS api_events (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    kind ENUM('nouvelle','modifiee','vague') NOT NULL,
    request_code VARCHAR(64) NULL,
    details TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS services (
    slug VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(16) NULL,
    summary VARCHAR(500) NOT NULL,
    details TEXT NOT NULL,
    hours VARCHAR(255) NULL,
    contact VARCHAR(255) NULL,
    sort_order INT NOT NULL DEFAULT 0
  )`,
  // Messages / demandes des habitants (D04, traités par les agents F22)
  `CREATE TABLE IF NOT EXISTS messages (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    reference VARCHAR(32) NOT NULL UNIQUE,
    user_id INT UNSIGNED NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(191) NOT NULL,
    service_slug VARCHAR(64) NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    status ENUM('nouveau','en_cours','traite') NOT NULL DEFAULT 'nouveau',
    agent_note TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_messages_user (user_id),
    INDEX idx_messages_email (email),
    INDEX idx_messages_status (status),
    CONSTRAINT fk_messages_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS news (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL DEFAULT 'Annonce',
    summary VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    author_id INT UNSIGNED NULL,
    published_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_news_published (published_at),
    CONSTRAINT fk_news_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
  )`,
  'INSERT IGNORE INTO api_state (id) VALUES (1)',
];

// Crée la base si besoin (ignoré si l'utilisateur MySQL n'en a pas le droit) puis les tables manquantes.
async function init() {
  if (!process.env.DATABASE_URL && config.database) {
    const { database, ...server } = config;
    try {
      const conn = await mysql.createConnection(server);
      await conn.query(`CREATE DATABASE IF NOT EXISTS \`${database.replace(/`/g, '')}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      await conn.end();
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') throw err;
    }
  }
  for (const sql of SCHEMA) await pool.query(`${sql}${sql.startsWith('CREATE') ? ' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4' : ''}`);
}

const ping = async () => (await get('SELECT 1 AS ok')).ok === 1;
const close = () => pool.end();

module.exports = { pool, all, get, run, init, ping, close };
