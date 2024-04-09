/* eslint-disable @typescript-eslint/no-explicit-any */
// routes/apiResponseRoutes.ts
import express, { Request, Response } from "express";
import { UserService } from "..";

import textLocalApi from "../utils/textLocalApi";
import { documentApproved } from "../utils/messageTemplate";

import { userServiceAttributes } from "../models/userModal";

const router = express.Router();

// Create - Add a new API response
router.post("/createUser", async (req: Request, res: Response) => {
    const {
        userName = '',
        userCode = '',
        profilePic = '',
        type = 'customer',
        phone = ''
    }: userServiceAttributes = req.body;

    try {
        const userCreateStatus = await UserService.create({
            userName,
            userCode,
            profilePic,
            type,
            phone
        })
        return res.json(userCreateStatus);
    } catch (error) {
        return res.status(500).json({ error: error });
    }
});

router.post("/validateUser", async (req: Request, res: Response) => {
    const {
        phone,
        userCode
    }: userServiceAttributes = req.body;


    try {
        const userCreateStatus = await UserService.findOne({
            where: { phone, userCode: userCode },
        })
        return res.json(userCreateStatus);
    } catch (error) {
        return res.status(500).json({ error: error });
    }
});

router.put('/updateUser', async (req: Request, res: Response) => {
    const { phone, profilePic }: userServiceAttributes = req.body;
    try {
        const user = await UserService.findOne({ where: { phone: phone } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        user['profilePic'] = profilePic;
        let updatedResponse = await user.update({ profilePic: profilePic }, {
            where: {
                phone
            }
        })
        return res.json(updatedResponse);
    } catch (error) {
        return res.status(500).json({ error: error });
    }
})

router.get("/getUser/:phoneNumber", async (req: Request, res: Response) => {
    const {
        phone
    }: userServiceAttributes = req.params;

    
    try {
        const userCreateStatus = await UserService.findOne({
            where: { phone },
        })
        return res.json(userCreateStatus);
    } catch (error) {
        return res.status(500).json({ error: error });
    }
});


// Update - Modify an API response by ID

// Delete - Remove an API response by ID


export default router;
