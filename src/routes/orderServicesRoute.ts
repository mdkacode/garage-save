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
        const { customerNumber = "", carNumber = '', carKilometer = 0, totalCost=0,
            serviceName = "", serviceType = "", car, serviceDate = "", isCompleted = false, productUsed = "", garageNumber = "", estimatedCost = 0 } = req.body;
        const calculatePrice = [];
        let total = await ProductService.findAll({ where: { id: { [Op.in]: productUsed } } }).then((products) => {
                return products.reduce((total, product) => {
                    let exactPrice = (product.sellingPrice - product.flatDiscount);
                   return  total + (exactPrice + (exactPrice * (product?.gst || 0) / 100));   
                }, 0);
           });

        // totalCost = productUsed.reduce((total, product) => total + product.productPrice, 0);
        const carServiceOrder = await OrderService.create({
            customerNumber,
            serviceName,
            car,
            carNumber,
            carKilometer,
            serviceType,
            serviceDate,
            estimatedCost: total,
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
                        poductGst: productInfo?.gst || 0,
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

        let total = productUsed ? await ProductService.findAll({ where: { id: { [Op.in]: productUsed } } }).then((products) => {
            return products.reduce((total, product) => {
                let exactPrice = (product.sellingPrice - product.flatDiscount);
               return  total + (exactPrice + (exactPrice * (product?.gst || 0) / 100));   
            }, 0);
       }) : 0;
        // Check if the customerNumber is of type "customer"
        // You can add additional validation logic here if needed

        const carServiceOrder = await OrderService.findByPk(id);

        if (!carServiceOrder) {
            return res.status(404).json({ message: "Car service order not found" });
        }

        if( total > 0){
            await carServiceOrder.update({
                customerNumber,
                serviceName,
                serviceType,
                carKilometer,
                car,
                estimatedCost: total,
                carNumber,
                serviceDate,
                isCompleted,
                productUsed,
                garageNumber,
            });
        }
        else 
        await carServiceOrder.update({
            customerNumber,
            serviceName,
            serviceType,
            carKilometer,
            car,
            carNumber,
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

router.post("/orderStats", async (req: Request, res: Response) => {

    try {
        const { type, garageNumber }: { type: 'today' | 'month' | 'year' | 'overall' | 'progress' | 'completed', garageNumber: string } = req.body;

        console.log(type);



        let totalOrders, completedOrders, pendingOrders, totalRevenue,ordersList;

        if (type === 'today') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            ordersList = await OrderService.findAll({
                where: {
                    garageNumber,
                    createdAt: {
                        [Op.gte]: today,
                        [Op.lt]: tomorrow
                    }
                }
            });

            totalOrders = await OrderService.count({
                where: {
                    garageNumber,
                    createdAt: {
                        [Op.gte]: today,
                        [Op.lt]: tomorrow
                    }
                }
            });
            completedOrders = await OrderService.count({
                where: {
                    isCompleted: true,
                    garageNumber,
                    createdAt: {
                        [Op.gte]: today,
                        [Op.lt]: tomorrow
                    }
                }
            });
            pendingOrders = await OrderService.count({
                where: {
                    isCompleted: false,
                    garageNumber,
                    createdAt: {
                        [Op.gte]: today,
                        [Op.lt]: tomorrow
                    }
                }
            });
            totalRevenue = await OrderService.sum('estimatedCost', {
                where: {
                    garageNumber,
                    createdAt: {
                        [Op.gte]: today,
                        [Op.lt]: tomorrow
                    }
                }
            });
        } else if (type === 'month') {
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);
            const endOfMonth = new Date(startOfMonth);
            endOfMonth.setMonth(endOfMonth.getMonth() + 1);
            ordersList = await OrderService.findAll({
                where: {
                    garageNumber,
                    createdAt: {
                        [Op.gte]: startOfMonth,
                        [Op.lt]: endOfMonth
                    }
                }
            });
            totalOrders = await OrderService.count({
                where: {
                    garageNumber,
                    createdAt: {
                        [Op.gte]: startOfMonth,
                        [Op.lt]: endOfMonth
                    }
                }
            });
            completedOrders = await OrderService.count({
                where: {
                    isCompleted: true,
                    garageNumber,
                    createdAt: {
                        [Op.gte]: startOfMonth,
                        [Op.lt]: endOfMonth
                    }
                }
            });
            pendingOrders = await OrderService.count({
                where: {
                    isCompleted: false,
                    garageNumber,
                    createdAt: {
                        [Op.gte]: startOfMonth,
                        [Op.lt]: endOfMonth
                    }
                }
            });
            totalRevenue = await OrderService.sum('estimatedCost', {
                where: {
                    garageNumber,
                    createdAt: {
                        [Op.gte]: startOfMonth,
                        [Op.lt]: endOfMonth
                    }
                }
            });
        } else if (type === 'year') {
            const startOfYear = new Date();
            startOfYear.setMonth(0, 1);
            startOfYear.setHours(0, 0, 0, 0);
            const endOfYear = new Date(startOfYear);
            endOfYear.setFullYear(endOfYear.getFullYear() + 1);
            ordersList = await OrderService.findAll({
                where: {
                    garageNumber,
                    createdAt: {
                        [Op.gte]: startOfYear,
                        [Op.lt]: endOfYear
                    }
                }
            });
            totalOrders = await OrderService.count({
                where: {
                    garageNumber,
                    createdAt: {
                        [Op.gte]: startOfYear,
                        [Op.lt]: endOfYear
                    }
                }
            });
            completedOrders = await OrderService.count({
                where: {
                    isCompleted: true,
                    garageNumber,
                    createdAt: {
                        [Op.gte]: startOfYear,
                        [Op.lt]: endOfYear
                    }
                }
            });
            pendingOrders = await OrderService.count({
                where: {
                    isCompleted: false,
                    garageNumber,
                    createdAt: {
                        [Op.gte]: startOfYear,
                        [Op.lt]: endOfYear
                    }
                }
            });
            totalRevenue = await OrderService.sum('estimatedCost', {
                where: {
                    garageNumber,
                    createdAt: {
                        [Op.gte]: startOfYear,
                        [Op.lt]: endOfYear
                    },

                }
            });
        } else if (type === 'overall') {
            totalOrders = await OrderService.count({ where: { garageNumber } });
            ordersList = await OrderService.findAll({ where: { garageNumber } });
            completedOrders = await OrderService.count({ where: { isCompleted: true, garageNumber } });
            pendingOrders = await OrderService.count({ where: { isCompleted: false, garageNumber } });
            totalRevenue = await OrderService.sum('estimatedCost');
        } else if (type === 'progress') {
            totalOrders = await OrderService.count({ where: { isCompleted: false, garageNumber } });
            ordersList = await OrderService.findAll({ where: {isCompleted: false, garageNumber } });
            completedOrders = await OrderService.count({ where: { isCompleted: false, garageNumber } });
            pendingOrders = 0;
            totalRevenue = await OrderService.sum('estimatedCost', { where: { isCompleted: false, garageNumber } });
        } else if (type === 'completed') {
            totalOrders = await OrderService.count({ where: { isCompleted: true, garageNumber } });
            completedOrders = totalOrders;
            ordersList = await OrderService.findAll({ where: { isCompleted:true,garageNumber } });
            pendingOrders = 0;
            totalRevenue = await OrderService.sum('estimatedCost', { where: { isCompleted: true, garageNumber } });
        } else {
            return res.status(400).json({ message: "Invalid type" });
        }

        res.json({ totalOrders,ordersList, completedOrders, pendingOrders, totalRevenue });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
})

export default router;