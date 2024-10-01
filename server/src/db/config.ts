import { type DataSourceOptions } from "typeorm";

let config: DataSourceOptions = {
  type: "postgres",
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  entities: ["dist/entities/*.js"],
  migrations: ["dist/migrations/*.js"],
  subscribers: ["dist/subscribers/*.js"],
  synchronize: true,

};

if (process.env.NODE_ENV === "dev") {
  console.log("dev mode");
  config = {
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "123456",
    database: "dev3",
    entities: ["dist/entities/*.js"],
    migrations: ["dist/migrations/*.js"],
    subscribers: ["dist/subscribers/*.js"],
    synchronize: true,
    
  };
}

export default config;
