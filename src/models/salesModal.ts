import { ENUM } from 'sequelize';
import { carServiceOrderAttributes } from './orderModal';


export interface salesServiceAttributes {
    totalSales: number;
    orders: carServiceOrderAttributes[];
    createdAt: string;
    updatedAt: string;
}