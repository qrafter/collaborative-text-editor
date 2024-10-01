import chalk from "chalk";
import moment from "moment";

import appDataSource from "./datasource";

const createConnection = async (): Promise<boolean> =>
  await new Promise((resolve, reject): void => {
    appDataSource
      .initialize()
      .then(() => {
        console.log(
          `${chalk.green("[INFO]")} ${moment().format(
            "YYYY-MM-DD HH:mm:ss",
          )} - Connected to DB 🗄️`,
        );
        resolve(true);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });

export default createConnection;
