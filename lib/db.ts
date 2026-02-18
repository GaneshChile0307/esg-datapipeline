import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

export async function getDbConnection() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      user: process.env.MYSQL_USER || 'esg_user',
      password: process.env.MYSQL_PASSWORD || 'esg_password',
      database: process.env.MYSQL_DATABASE || 'esg_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

export async function initializeDatabase() {
  const connection = await getDbConnection();
  
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS esg_data (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_name VARCHAR(255) NOT NULL,
      reporting_year INT NOT NULL,
      scope1_tco2e DECIMAL(10, 2) NOT NULL,
      scope2_tco2e DECIMAL(10, 2) NOT NULL,
      scope3_tco2e DECIMAL(10, 2) DEFAULT NULL,
      energy_consumption_kwh DECIMAL(10, 2) DEFAULT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `;
  
  await connection.query(createTableQuery);
  console.log('✓ Database table initialized');
}
