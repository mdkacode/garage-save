/* eslint-disable @typescript-eslint/no-explicit-any */
// routes/apiResponseRoutes.ts
import express, { Request, Response } from "express";
import { GarageService } from "..";
// ...


import { userServiceAttributes } from "../models/userModal";


const router = express.Router();

// Create - Add a new garage service
router.post("/createGarageService", async (req: Request, res: Response) => {
    const {
        garageOwner = '',
        address = '',
        contactNumber = 0,
        ownerPhoneNumber = 0,
        garageName = '',
        isPaid = false,
        isMessageEnabled = false,
        icon = ''
    } = req.body;
    try {
        const garageService = await GarageService.create({
            garageOwner,
            address,
            isMessageEnabled,
            ownerPhoneNumber,
            isPaid,
            contactNumber,
            garageName,
            icon
        });
        return res.json(garageService);
    } catch (error) {
        return res.status(500).json({ error: error });
    }
});

// Read - Get all garage services
router.get("/getGarageServices", async (req: Request, res: Response) => {
    try {
        const garageServices = await GarageService.findAll();
        return res.json(garageServices);
    } catch (error) {
        return res.status(500).json({ error: error });
    }
});

// Read - Get a garage service by ID
router.get("/getGarageService/:phoneNumber", async (req: Request, res: Response) => {
    const { phoneNumber } = req.params;
    try {
        const garageService = await GarageService.findAll({
            where:{
                contactNumber:phoneNumber
            }
        });
        if (!garageService) {
            return res.status(404).json({ error: "Garage service not found" });
        }
        return res.json(garageService);
    } catch (error) {
        return res.status(500).json({ error: error });
    }
});

// Update - Modify a garage service by ID
router.put('/updateGarageService/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
        garageOwner = '',
        address = '',
        contactNumber = 0,
        ownerPhoneNumber = 0,
        garageName = '',
        isPaid = false,
        isMessageEnabled = false,
        icon = ''
    } = req.body;
    try {
        const garageService = await GarageService.findByPk(id);
        if (!garageService) {
            return res.status(404).json({ error: "Garage service not found" });
        }
        garageService.garageOwner = garageOwner;
        garageService.address = address;
        garageService.contactNumber = contactNumber;
        garageService.garageName = garageName;
        garageService.isPaid = isPaid;
        garageService.ownerPhoneNumber = ownerPhoneNumber;
        garageService.isMessageEnabled = isMessageEnabled;
        garageService.icon = icon;
        await garageService.save();
        return res.json(garageService);
    } catch (error) {
        return res.status(500).json({ error: error });
    }
});

// Delete - Remove a garage service by ID
router.delete('/deleteGarageService/:phoneNumber', async (req: Request, res: Response) => {
    const { phoneNumber } = req.params;
    try {
        const garageService = await GarageService.findOne({
            where:{
                contactNumber:phoneNumber
            }
        })
        if (!garageService) {
            return res.status(404).json({ error: "Garage service not found" });
        }
        await garageService.destroy();
        return res.json({ message: "Garage service deleted successfully" });
    } catch (error) {
        return res.status(500).json({ error: error });
    }
});


// Update - Modify an API response by ID

// Delete - Remove an API response by ID


export default router;
