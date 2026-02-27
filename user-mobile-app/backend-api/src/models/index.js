// Model index file - combines all models
import fs from 'fs';
import path from 'path';
import { Sequelize } from 'sequelize';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let sequelize;

if (process.env.DB_CONNECTION === 'mysql') {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'artandcraft',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      pool: {
        min: parseInt(process.env.DB_POOL_MIN || '2'),
        max: parseInt(process.env.DB_POOL_MAX || '10'),
      },
      logging: false,
      define: {
        timestamps: true,
        underscored: false,
        freezeTableName: true,
      },
    }
  );
} else {
  sequelize = new Sequelize('sqlite::memory:');
}

const db = {
  sequelize,
  Sequelize,
};

// Load models
const modelFiles = fs.readdirSync(__dirname).filter(
  (file) => file.endsWith('.js') && file !== 'index.js'
);

for (const file of modelFiles) {
  const model = (await import(`./${file}`)).default;
  const modelInstance = model(sequelize, Sequelize.DataTypes);
  db[modelInstance.name] = modelInstance;
}

// Associate models
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

export default db;
