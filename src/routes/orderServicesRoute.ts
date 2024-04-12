import express, { Request, Response } from "express";
import { Op } from "sequelize";
import { CarListService, OrderService, ProductService } from "..";
import sequelize from "sequelize";
// import defineOrderService, { OrderService, carServiceOrderAttributes } from "./models/OrderService";

const router = express.Router();

// Create a new car service order
// Create a new car service order
router.post("/addCustomer", async (req: Request, res: Response) => {
    try {
        const { customerNumber = "", carNumber = '', carKilometer = 0, serviceName = "", serviceType = "", car, serviceDate = "", isCompleted = false, productUsed = "", garageNumber = "", estimatedCost = 0 } = req.body;
        const calculatePrice = [];
        // Check if the customerNumber is of type "customer"
        // You can add additional validation logic here if needed

        const carServiceOrder = await OrderService.create({
            customerNumber,
            serviceName,
            car,
            carNumber,
            carKilometer,
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
                        productPrice: acutalSellingPrice ,
                        poductGst:  productInfo?.gst || 0,
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

// Read all car service orders with the same garageNumber
router.get("/customers/:garageNumber", async (req: Request, res: Response) => {
    try {
        const { garageNumber } = req.params;
        const carServiceOrders = await OrderService.findAll({ where: { garageNumber } });

        const ordersWithProducts = [];
        for (const order of carServiceOrders) {
            const productIds = order.productUsed;
            const products = await ProductService.findAll({ where: { id: { [Op.in]: productIds } } });
            const calculatePrice = [];
            if (order.car) {
                let carDetails = await CarListService.findByPk(order.car);
                //@ts-ignore
                order['car'] = {
                    id: carDetails?.id,
                    label: `${carDetails?.model} ${carDetails?.brand}`,
                    value: carDetails?.id?.toLocaleString(),
                    image: carDetails?.imageUri,
                    year: carDetails?.year,
                    subLabel: carDetails?.fuel_type,
                    addedBy: carDetails?.addedBy
                };
            }

            for (const product of products) {
                if (product.sellingPrice && product.sellingPrice > 0) {
                    let actualSellingPrice = product.sellingPrice;
                    if (product.flatDiscount && product.flatDiscount > 0) {
                        actualSellingPrice = product.sellingPrice - product.flatDiscount;
                    }
                    if (product.percentageDiscount && Number(product.percentageDiscount) > 0) {
                        actualSellingPrice = product.sellingPrice - (product.sellingPrice * Number(product.percentageDiscount) / 100);
                    }
                    calculatePrice.push({
                        ...product.dataValues,
                        label: product.productName,
                        subLabel: actualSellingPrice,
                        productPrice: actualSellingPrice,
                        productMrp: product.mrp,
                        productDiscount: product.mrp ? product.mrp - actualSellingPrice : '-',
                    });
                }

               
                
            }
            const totalPrice = calculatePrice.reduce((total, product) => total + product.productPrice, 0);
            const totalDiscount = calculatePrice.reduce((total, product) => total + (product?.productMrp ? product?.productMrp - product.productPrice : 0), 0);
            ordersWithProducts.push({ order, products: calculatePrice, totalPrice, totalDiscount });
        }
        res.status(200).json(ordersWithProducts);

        // res.status(201).json({ carServiceOrder, products: calculatePrice });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
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
router.put("/updateCustomer/:id", async (req: Request, res: Response) => {
    try {

        const { id } = req.body;
        const { customerNumber, serviceName, carKilometer, car, carNumber, estimatedCost, serviceType, serviceDate, isCompleted, productUsed, garageNumber } = req.body;

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
            carKilometer,
            car,
            carNumber,
            estimatedCost,
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