import { ARRAY } from "sequelize";
import { ENUM } from "sequelize";
import { BOOLEAN, DATE, INTEGER, Model, STRING, Sequelize } from "sequelize";
import { ProductService } from "..";

export interface carServiceOrderAttributes {
    customerNumber: string;
    serviceName: string;
    serviceType: "periodic" | "one Time" | "washing" | "checkup";
    serviceDate: Date;
    estimatedCost: number;
    isCompleted: boolean;
    createdAt?: Date;
    productUsed?: number[];
    updatedAt?: Date;
    garageNumber?: string;
}

interface carServiceOrderModel extends Model<carServiceOrderAttributes>, carServiceOrderAttributes { }

const defineCarServiceOrderModel = (sequelize: Sequelize) => {
    const carServiceOrder = sequelize.define<carServiceOrderModel, unknown>(
        "carServiceOrders",
        {
            id: {
                type: INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },

            serviceName: {
                type: STRING,
                allowNull: false,
            },
            estimatedCost: {
                type: INTEGER,
                allowNull: false,
            },
            serviceType: {
                type: ENUM("periodic", "one Time", "washing", "checkup"),
                allowNull: false,
            },
            serviceDate: {
                type: DATE,
                allowNull: false,
            },
            isCompleted: {
                type: BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            createdAt: {
                type: DATE,
                allowNull: false,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
            productUsed: {
                type: ARRAY(INTEGER),
                allowNull: false
            },
            garageNumber: {
                type: STRING,
                allowNull: false,
                references: {
                    model: 'garages',
                    key: 'contactNumber',
                },
            },
            customerNumber:{
                type: STRING,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'phone',
                },
            }
        }
    );

    carServiceOrder.belongsToMany(ProductService, { through: 'CarServiceOrderProducts' });
    ProductService.belongsToMany(carServiceOrder, { through: 'CarServiceOrderProducts' });
    return carServiceOrder;
};

export default defineCarServiceOrderModel;