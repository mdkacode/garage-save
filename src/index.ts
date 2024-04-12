/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Express, Request, Response } from "express";
import sequelize from "./config/config";
import dotenv from "dotenv";
import cors from "cors";
import aws from "aws-sdk";

import uploadServicesRoutes from "./routes/uploadServices";
import userServiceRoute from "./routes/userServiceRoute";
import garageServiceRoute from "./routes/garageServiceRoute";
import productServiceRoute from "./routes/productService";
import orderServicesRoute from "./routes/orderServicesRoute";
import carServicesRoute from "./routes/carServiceRoute";

import defineUploadFileServiceModel from "./models/uploadFileModal";
import defineUserServiceModel from "./models/userModal";
import defineGarageServiceModel from "./models/garageModal";
import defineProductServiceModel from "./models/productModal";
import defineOrderServiceModel from "./models/orderModal";
import defineCarServiceModel from "./models/carListModal";
import path from "path";
import coverttopdf from "./utils/pdfFromHtml";
dotenv.config();

const spaceEndpoint = new aws.Endpoint("blr1.digitaloceanspaces.com");
export const s3 = new aws.S3({
  endpoint: spaceEndpoint,
});

const app: Express = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static('public'));
app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);
app.use(express.json());
const port = 80;
async function testDatabaseConnection() {
  try {
    await sequelize.authenticate();
  } catch (error) {
    return;
  }
}

testDatabaseConnection();

sequelize.sync({ force: false })

export const UploadFileService = defineUploadFileServiceModel(sequelize);
export const UserService = defineUserServiceModel(sequelize);
export const GarageService = defineGarageServiceModel(sequelize);
export const ProductService = defineProductServiceModel(sequelize);
export const OrderService = defineOrderServiceModel(sequelize);
export const CarListService = defineCarServiceModel(sequelize);
// export const authRoutesApi = authRoutes(sequelize);


app.use("/api/upload", uploadServicesRoutes);
app.use("/api/user", userServiceRoute);
app.use("/api/garage", garageServiceRoute);
app.use("/api/product", productServiceRoute);
app.use("/api/order", orderServicesRoute);
app.use("/api/car", carServicesRoute);
app.use("/conver", coverttopdf);
app.get("/", (req: Request, res: Response) => {
  res.send("<marquee>MESSAGE SERVICE</marquee>");
});

app.listen(port, () => {

  // eslint-disable-next-line no-console
  console.log(`Server is running on port ${port}`)
})
