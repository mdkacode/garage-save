// models/uploadService.ts

import { DATE, INTEGER, Model, STRING, Sequelize } from "sequelize";

export interface uploadInterface {
  id?: number;
  fileName: string;
  fileUrl?: string;
  uploadedBy?: string;
  meta?: object;
}

interface uploadServiceModel extends Model<uploadInterface>, uploadInterface {}

const defineuploadServiceModel = (sequelize: Sequelize) => {
  const uploadService = sequelize.define<uploadServiceModel, unknown>(
    "uploadService",
    {
      id: {
        type: INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      fileName: {
        type: STRING,
        allowNull: false,
      },
      fileUrl: {
        type: STRING,
        allowNull: true,
      },
      uploadedBy: {
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
    }
  );

  return uploadService;
};

export default defineuploadServiceModel;
