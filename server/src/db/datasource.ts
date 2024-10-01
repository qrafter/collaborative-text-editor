import "reflect-metadata";

import { DataSource } from "typeorm";

import config from "./config";

const appDataSource = new DataSource(config);

export default appDataSource;
