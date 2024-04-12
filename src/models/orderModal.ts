import { ARRAY } from "sequelize";
import { ENUM } from "sequelize";
import { BOOLEAN, DATE, INTEGER, Model, STRING, Sequelize } from "sequelize";
import { ProductService } from "..";
import { JSONB } from "sequelize";

export interface carServiceOrderAttributes {
    customerNumber: string;
    serviceName?: string;
    car?: number | string;
    label?: string;
    image?: string;
    year?: string;
    subLabel?: string;
    addedBy?: string;
    serviceType: "periodic" | "one Time" | "washing" | "checkup";
    serviceDate: Date;
    estimatedCost: number;
    carNumber?: string;
    carKilometer?: number;
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
            car: {
                type: INTEGER,
                allowNull: false,
                references: {
                    model: 'cars',
                    key: 'id',
                },
            },
            carNumber:{
                type: STRING,
                allowNull: true,
            },
            carKilometer:{
                type: INTEGER,
                allowNull: true,
            },
            serviceName: {
                type: STRING,
                allowNull: true,
            },
            estimatedCost: {
                type: INTEGER,
                allowNull: true,
            },
            serviceType: {
                type: ENUM("periodic", "one Time", "washing", "checkup"),
                allowNull: true,
            },
            serviceDate: {
                type: DATE,
                allowNull: true,
            },
            isCompleted: {
                type: BOOLEAN,
                allowNull: true,
                defaultValue: false,
            },
            createdAt: {
                type: DATE,
                allowNull: false,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
            productUsed: {
                type: ARRAY(INTEGER),
                allowNull: true
            },
            garageNumber: {
                type: STRING,
                allowNull: false,
                references: {
                    model: 'garages',
                    key: 'contactNumber',
                },
            },
            customerNumber: {
                type: STRING,
                allowNull: false,
                
            }
        }
    );

    carServiceOrder.belongsToMany(ProductService, { through: 'CarServiceOrderProducts' });
    ProductService.belongsToMany(carServiceOrder, { through: 'CarServiceOrderProducts' });
    return carServiceOrder;
};

export default defineCarServiceOrderModel;