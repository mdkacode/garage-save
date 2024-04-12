
import { NUMBER } from "sequelize";
import { DATE, INTEGER, Model, STRING, Sequelize } from "sequelize";

export interface productServiceAttributes {
    id?: number;
    productName?: string;
    qty?: number;
    scannedValue?: string;
    expiryDate?: Date;
    car?: string;
    purchasePrice?: number;
    mrp?: number;
    sellingPrice?: number;
    flatDiscount?: number;
    percentageDiscount: string;
    gst?: number;
    createdAt?: Date;
    updatedAt?: Date;
    createdBy?: string;
    garageContactNumber:string;
}

interface productServiceModel
    extends Model<productServiceAttributes>,
    productServiceAttributes { }

const defineProductServiceModel = (sequelize: Sequelize) => {
    const productService = sequelize.define<productServiceModel, unknown>(
        "products",
        {
            id: {
                type: INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            productName: {
                type: STRING,
                allowNull: false,

            },
            car:{
                type: INTEGER,
                allowNull: true,
                references: {
                    model: 'cars',
                    key: 'id',
                },
            },
            gst: {
                type: INTEGER,
                allowNull: true,
            },
            scannedValue:{
                type: STRING,
                allowNull: true,
            },
            qty: {
                type: INTEGER,
                allowNull: true,
            },

            expiryDate: {
                type: DATE,
                allowNull: true,
            },
            purchasePrice: {
                type: INTEGER,
                allowNull: true,
            },
            mrp: {
                type: INTEGER,
                allowNull: true,
            },
            sellingPrice: {
                type: INTEGER,
                allowNull: true,
            },
            flatDiscount: {
                type: INTEGER,
                allowNull: true,
            },

            percentageDiscount: {
                type: STRING,
                allowNull: true,
            },
            garageContactNumber: {
                type: STRING,
                allowNull: false,
            },
            createdAt: {
                type: DATE,
                allowNull: false,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
            updatedAt: {
                type: DATE,
                allowNull: false,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
            createdBy: {
                type: STRING,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'phone',
                },
            },
        }, {
        indexes: [{ unique: true, fields: ['productName'] }]
    }
    );

    return productService;
};

export default defineProductServiceModel;
