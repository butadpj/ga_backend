module.exports = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['dist/**/entity/*.{ts,js}'],
  synchronize: false,
  migrations: ['dist/**/migrations/*.{ts,js}'],
  migrationsTableName: 'migrations',
  migrationsRun: false,
  cli: {
    migrationsDir: './src/migrations',
  },
};
