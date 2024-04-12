import express, { Request, Response } from "express";
import { CarListService, ProductService } from "..";

const router = express.Router();

// Create a new product
router.post("/products", async (req: Request, res: Response) => {
    try {
        const { productName = '',
            qty = 0, expiryDate = '',
            purchasePrice = 0, mrp = 0,
            sellingPrice = 0, flatDiscount = 0,
            percentageDiscount = 0,
            garageContactNumber = '',
            createdBy = '',
            car,
            gst = 0,
            scannedValue= ''
        } = req.body;

        // Check if mrp, sellingPrice, and purchasePrice are valid numbers
        if (isNaN(mrp) || isNaN(sellingPrice) || isNaN(purchasePrice)) {
            return res.status(400).json({ message: "mrp, sellingPrice, and purchasePrice must be valid numbers" });
        }

        // Check if mrp is greater than sellingPrice
        if (mrp < sellingPrice) {
            return res.status(400).json({ message: "mrp must be greater than sellingPrice" });
        }

        // Check if sellingPrice is greater than purchasePrice
        if (sellingPrice < purchasePrice) {
            return res.status(400).json({ message: "sellingPrice must be greater than purchasePrice" });
        }
        // Validate the request body
        if (!productName || !garageContactNumber) {
            return res.status(400).json({ message: "productName and garageContactNumber are required" });
        }

        // Create the product
        const product = await ProductService.create({
            productName,
            qty,
            expiryDate,
            purchasePrice,
            scannedValue,
            gst,
            car,
            mrp,
            sellingPrice,
            flatDiscount,
            percentageDiscount,
            garageContactNumber,
            createdBy,
        });

        return res.status(201).json(product);
    } catch (error) {
        console.error("Error creating product:", error);
        return res.status(500).json({ message: "Internal server error",error });
    }
});

// Read all products
router.get("/products", async (req: Request, res: Response) => {
    try {
        let {garageContactNumber = ''}:{garageContactNumber:string} = req.query as {garageContactNumber:string};
        if(req.query.garageContactNumber){
            const products = await ProductService.findAll({
                where: {
                    garageContactNumber: garageContactNumber
                }
            });
            const productsWithCarName = await Promise.all(products.map(async (product) => {
                const carName = product.car ?  await CarListService.findByPk(product.car) : null;
                if(typeof carName?.brand == 'string') product['car'] = carName?.brand;
                return  product;
            }));
            return res.json([...productsWithCarName]);
            // return res.json(products);
        }
        else {
            // const products = await ProductService.findAll();
            return res.json({message:"Please provide garageContactNumber"});
        }
       
        
    } catch (error) {
        console.error("Error fetching products:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Read a single product
router.get("/products/:id", async (req: Request, res: Response) => {
    try {

        
        const { id } = req.params;
        const product = await ProductService.findByPk(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        return res.json(product);
    } catch (error) {
        console.error("Error fetching product:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Update a product
router.put("/products/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { productName, qty, expiryDate,car, purchasePrice, mrp,gst, sellingPrice, flatDiscount,scannedValue, percentageDiscount, garageContactNumber } = req.body;

        // Validate the request body
        if (!productName || !garageContactNumber) {
            return res.status(400).json({ message: "productName and garageContactNumber are required" });
        }

        if (isNaN(mrp) || isNaN(sellingPrice) || isNaN(purchasePrice)) {
            return res.status(400).json({ message: "mrp, sellingPrice, and purchasePrice must be valid numbers" });
        }

        // Check if mrp is greater than sellingPrice
        if (mrp < sellingPrice) {
            return res.status(400).json({ message: "mrp must be greater than sellingPrice" });
        }

        // Check if sellingPrice is greater than purchasePrice
        if (sellingPrice < purchasePrice) {
            return res.status(400).json({ message: "sellingPrice must be greater than purchasePrice" });
        }
        // Validate the request body
        if (!productName || !garageContactNumber) {
            return res.status(400).json({ message: "productName and garageContactNumber are required" });
        }

        // Find the product
        const product = await ProductService.findByPk(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Update the product
        product.productName = productName;
        product.qty = qty;
        product.expiryDate = expiryDate;
        product.purchasePrice = purchasePrice;
        product.mrp = mrp;
        product.gst = gst;
        product.car = car;
        product.scannedValue =scannedValue;
        product.sellingPrice = sellingPrice;
        product.flatDiscount = flatDiscount;
        product.percentageDiscount = percentageDiscount;
        product.garageContactNumber = garageContactNumber;
        await product.save();

        return res.json(product);
    } catch (error) {
        console.error("Error updating product:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Delete a product
router.delete("/products/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Find the product
        const product = await ProductService.findByPk(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Delete the product
        await product.destroy();

        return res.json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default router;