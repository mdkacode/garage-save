import express, { Request, Response } from 'express';

import { CarListService } from '..';
import { carListAttributes } from '../models/carListModal';
import { Op } from 'sequelize';


const router = express.Router();

// Create a new car
router.post('/cars', async (req: Request, res: Response) => {
    try {
        const { brand, model, year, fuel_type, addedBy } = req.body;
        const car: carListAttributes = { brand, model, year, fuel_type, addedBy };
        const newCar = await CarListService.create(car);
        res.status(201).json(newCar);
    } catch (error) {
        res.status(500).json({ msg: 'Internal server error',error });
    }
});

// Get all cars
router.get('/cars', async (req: Request, res: Response) => {
    try {
        const cars = await CarListService.findAll();
        res.json(cars);
    } catch (error) {
        res.status(500).json({ msg: 'Internal server error',error });
    }
});

// Get a car by ID
router.get('/findcars', async (req: Request, res: Response) => {
    try {
        const { q } = req.query as { q: string };
        let car;
        {
            car = await CarListService.findOne({
                where: {
                    [Op.or]: [
                        { brand: { [Op.iLike]: `%${q}%` } },
                        { model: { [Op.iLike]: `%${q}%` } }
                    ]
                }
            });
        }
        if (!car) {
            res.status(404).json({ error: 'Car not found' });
        } else {
            res.json(car);
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update a car by ID
router.put('/cars/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { brand, model, year, fuel_type, addedBy } = req.body;
        const car: carListAttributes = { brand, model, year, fuel_type, addedBy };
        const updatedCar = await CarListService.update(car, { where: { id } });
        if (updatedCar[0] === 0) {
            res.status(404).json({ error: 'Car not found' });
        } else {
            res.json({ message: 'Car updated successfully' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a car by ID
router.delete('/cars/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deletedCar = await CarListService.destroy({ where: { id } });
        if (deletedCar === 0) {
            res.status(404).json({ error: 'Car not found' });
        } else {
            res.json({ message: 'Car deleted successfully' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add multiple cars at once
router.post('/cars/bulk', async (req: Request, res: Response) => {
    try {
        const { addedBy, cars }: { addedBy: string, cars: carListAttributes[] } = req.body;
        if (!addedBy) {
            return res.status(400).json({ error: 'addedBy is required' });
        }
        const newCars: carListAttributes[] = [];
        for (const car of cars) {
            const existingCar = await CarListService.findOne({ where: { brand: car.brand, model: car.model } });
            if (!existingCar) {
                car['addedBy'] = addedBy;
                const newCar = await CarListService.create(car);
                newCars.push(newCar);
            }
        }
        res.status(201).json(newCars);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', errorMsg: error });
    }
});

export default router;