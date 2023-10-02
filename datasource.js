import { appConfig } from "./src/utils/app-config"
const { DataSource } = require("typeorm");

const AppDataSource = new DataSource({
  type: appConfig.databaseType | "postgres",
  port: Number(appConfig.databasePort) || 5432,
  username: appConfig.databaseUsername || "postgres",
  password: appConfig.databasePassword,
  database: appConfig.databaseName,
  entities: ["dist/models/*.js"],
  migrations: ["dist/migrations/*.js"],
});

module.exports = {
  datasource: AppDataSource,
};
