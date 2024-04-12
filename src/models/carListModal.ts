
import { NUMBER } from "sequelize";
import { DATE, INTEGER, Model, STRING, Sequelize } from "sequelize";

export interface carListAttributes {
    id?: number;
    "brand"?: string;
    "model"?: string;
    "year"?: string;
    imageUri?: string;
    "fuel_type"?: string[];
    "addedBy"?: string;
    createdAt?: Date;
    updatedAt?: Date;
}



interface carServiceModel
    extends Model<carListAttributes>,
    carListAttributes { }

const defineCarServiceModel = (sequelize: Sequelize) => {
    const carService = sequelize.define<carServiceModel, unknown>(
        "cars",
        {
            id: {
                type: INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            brand: {
                type: STRING,
                allowNull: false,
            },
            imageUri: {
                type: STRING,
                allowNull: true,
            },
            model: {
                type: STRING,
                allowNull: false,
            },
            year: {
                type: STRING,
                allowNull: false,
            },
            fuel_type: {
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
            addedBy: {
                type: STRING,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'phone',
                },
            }
        },
        {
            timestamps: true,
            indexes: [{ unique: true, fields: ['id'] },
            { unique: true, fields: ['model'] }]
        }
    );
    return carService;
}

export default defineCarServiceModel;