import express, { Request, Response } from "express";
import { Op } from "sequelize";
import { OrderService, ProductService } from "..";
import sequelize from "sequelize";
// import defineOrderService, { OrderService, carServiceOrderAttributes } from "./models/OrderService";

const router = express.Router();

// Create a new car service order
router.post("/addCustomer", async (req: Request, res: Response) => {
    try {
        const { customerNumber = "", serviceName = "", serviceType = "", serviceDate = "", isCompleted = false, productUsed = "", garageNumber = "", estimatedCost = 0 } = req.body;
        const calculatePrice = [];
        // Check if the customerNumber is of type "customer"
        // You can add additional validation logic here if needed

        const carServiceOrder = await OrderService.create({
            customerNumber,
            serviceName,
            serviceType,
            serviceDate,
            estimatedCost,
            isCompleted,
            productUsed,
            garageNumber,
        });

        // Reduce the quantity of the product in products
        // You will need to replace "Product" with the actual model name for your product table
        // You will also need to replace "productQuantity" with the actual column name for the quantity in your product table
        for (const product of productUsed) {
            await ProductService.update(
                { qty: sequelize.literal(`qty - 1`) },
                { where: { id: product } }
            );
        }

        // Calculate the estimate and savings
        for (const product of productUsed) {
            const productInfo = await ProductService.findOne({ where: { id: product } });

            if (productInfo?.sellingPrice && productInfo?.sellingPrice > 0) {
                let acutalSellingPrice = productInfo?.sellingPrice;
                if (productInfo?.flatDiscount && productInfo?.flatDiscount > 0) {
                    acutalSellingPrice = productInfo?.sellingPrice - productInfo?.flatDiscount;
                }
                if (productInfo?.percentageDiscount && Number(productInfo?.percentageDiscount) > 0) {
                    acutalSellingPrice = productInfo?.sellingPrice - (productInfo?.sellingPrice * Number(productInfo?.percentageDiscount) / 100);

                }
                calculatePrice.push(
                    {
                        productName: productInfo?.productName,
                        productPrice: acutalSellingPrice,
                        productMrp: productInfo?.mrp,
                        productDiscount: productInfo?.mrp ? productInfo?.mrp - acutalSellingPrice : '-',
                    }
                )
            }

        }

        res.status(201).json({ carServiceOrder, products: calculatePrice });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", error });
    }
});

// Read all car service orders
router.get("/customers", async (req: Request, res: Response) => {
    try {
        const carServiceOrders = await OrderService.findAll();
        res.json(carServiceOrders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Read a single car service order by ID
router.get("/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const carServiceOrder = await OrderService.findByPk(id);

        if (!carServiceOrder) {
            return res.status(404).json({ message: "Car service order not found" });
        }

        res.json(carServiceOrder);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Update a car service order by ID
router.put("updateCustomer/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { customerNumber, serviceName, serviceType, serviceDate, isCompleted, productUsed, garageNumber } = req.body;

        // Check if the customerNumber is of type "customer"
        // You can add additional validation logic here if needed

        const carServiceOrder = await OrderService.findByPk(id);

        if (!carServiceOrder) {
            return res.status(404).json({ message: "Car service order not found" });
        }

        await carServiceOrder.update({
            customerNumber,
            serviceName,
            serviceType,
            serviceDate,
            isCompleted,
            productUsed,
            garageNumber,
        });

        res.json(carServiceOrder);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Delete a car service order by ID
router.delete("deleteCustomer/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const carServiceOrder = await OrderService.findByPk(id);

        if (!carServiceOrder) {
            return res.status(404).json({ message: "Car service order not found" });
        }

        await carServiceOrder.destroy();
        res.json({ message: "Car service order deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;