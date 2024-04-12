/* eslint-disable @typescript-eslint/ban-ts-comment */
// config.ts

import { Sequelize } from "sequelize";
import dotenv from "dotenv";
// import fs from "fs";
dotenv.config();


// const certContent = fs.readFileSync(__dirname + "/kyc_db.cer");

//@ts-ignore
// eslint-disable-next-line no-console
// console.log(certContent);

const prodConfig ={
	ssl: {
		rejectUnauthorized: false,
	},
	pool: {
		max: 5,
		min: 0,
		acquire: 30000,
		idle: 10000,
	},
}
const { DB_CONNECTION_STRING,DB_MODE } = process.env;
console.log(DB_CONNECTION_STRING);
const sequelize = new Sequelize(
	DB_CONNECTION_STRING || "", // Ensure DB_CONNECTION_STRING is not undefined
	{
		dialectOptions: DB_MODE == 'PROD' ? prodConfig : {},
	}
);

export default sequelize;
