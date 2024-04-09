// models/garageService.ts
import { BOOLEAN } from "sequelize";
import { DATE, INTEGER, Model, STRING, Sequelize } from "sequelize";

export interface garageServiceAttributes {
    garageName?: string;
    garageOwner: string;
    icon: string;
    isMessageEnabled?: boolean;
    isPaid?: boolean;
    contactNumber?: string;
    address?: string;
    ownerPhoneNumber?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

interface garageServiceModel
    extends Model<garageServiceAttributes>,
    garageServiceAttributes { }

const defineGarageServiceModel = (sequelize: Sequelize) => {
    const garageService = sequelize.define<garageServiceModel, unknown>(
        "garages",
        {
            id: {
                type: INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            garageName: {
                type: STRING,
                allowNull: false,
                unqiue: true,

            },
            garageOwner: {
                type: STRING,
                allowNull: false,
            },

            isMessageEnabled: {
                type: BOOLEAN,
                allowNull: true,
            },
            isPaid: {
                type: BOOLEAN,
                allowNull: true,
            },
            icon: {
                type: STRING,
                allowNull: true,
            },
            address: {
                type: STRING,
                allowNull: true,
            },
            contactNumber: {
                type: STRING,
                allowNull: true,
                unique: true
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
            ownerPhoneNumber: {
                type: STRING,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'phone',
                },
            }
        }, {
        indexes: [{ unique: true, fields: ['contactNumber'] }]
    }
    );

    return garageService;
};

export default defineGarageServiceModel;
