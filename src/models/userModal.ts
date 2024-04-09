// models/emailService.ts
// import { JSONB } from "sequelize";
import { ENUM } from "sequelize";
import { DATE, INTEGER, Model, STRING, Sequelize } from "sequelize";

export interface userServiceAttributes {
    phone?: string;
    userCode?: string;
    userName?: string;
    profilePic?: string;
    createdAt?: Date;
    updatedAt?: Date;
    type?: "customer" | 'owner' | 'worker' | 'temp';

}

interface userServiceModel
    extends Model<userServiceAttributes>,
    userServiceAttributes { }

const defineUserServiceModel = (sequelize: Sequelize) => {
    const emailService = sequelize.define<userServiceModel, unknown>(
        "users",
        {
            id: {
                type: INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            phone: {
                type: STRING,
                allowNull: false,
                unqiue: true,

            },
            type: {
                type: ENUM("customer", 'owner', 'worker', 'temp'),
                allowNull: false,
            },
            userCode: {
                type: STRING,
                allowNull: false,
            },

            userName: {
                type: STRING,
                allowNull: true,
            },
            profilePic: {
                type: STRING,
                allowNull: true,
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
        },{
            indexes: [{ unique: true, fields: ['phone'] }]
        }
    );

    return emailService;
};

export default defineUserServiceModel;
