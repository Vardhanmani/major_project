import { Request, Response } from "express"
import { prisma } from "../config/prisma.js"

//GET /api/products/flash-deals
export const getFlashDeals = async (req : Request ,res: Response)=>{
    //fetch product from database
    const products = await prisma.product.findMany({
        where : {stock :{gt:0}},
        orderBy : {originalPrice : "desc"}
    })
    //add a iscount field
    const productsWithDiscount = products.map((p:any)=>{
        const discount = p.originalPrice && p.price ? Math.round(((p.originalPrice - p.price)/p.originalPrice)*100): 0;
        return {...p , discount}
    })
    res.json ({products : productsWithDiscount.slice(0,8)});
}
//GET/api/products
export const getProducts = async (req : Request,res: Response) =>{
    //category
    const {category , search, minPrice,maxPrice , sort} =req.query;
    //category - category , name , maxprice , minprice
    const where : any= {};
    if(category && category !== 'all')where.category = category as string;
    if(search)where.name = {contains : search as string , mode : "insensitive"};
    if(minPrice || maxPrice){
        if(minPrice)where.price.gte = Number(minPrice)
        if(maxPrice)where.price.lte = Number(maxPrice)
    }
    //category - sort
    const orderBy : any = {};
    if(sort === "price-low")orderBy.price='asc'
    else if(sort === "price-high")orderBy.price='desc'
    else orderBy.createdAT = 'desc'
    //featching product
    const products = await prisma.product.findMany({where ,orderBy})
    //add a iscount field
    const productsWithDiscount = products.map((p:any)=>{
        const discount = p.originalPrice && p.price ? Math.round(((p.originalPrice - p.price)/p.originalPrice)*100): 0;
        return {...p , discount}
    })
    res.json({products: productsWithDiscount});
}
// GET /api/products/:id
export const getProductById = async (req: Request, res: Response) => {
    // Find the product
    const product = await prisma.product.findUnique({
        where: { id :req.params.id as string }
    });
    // Check if product exists
    if (!product) {
        return res.status(404).json({
            message: "Product not found"
        });
    }
    // Calculate discount
    const discount =
        product.originalPrice && product.price
            ? Math.round(
                  ((product.originalPrice - product.price) /
                      product.originalPrice) *
                      100
              )
            : 0;
    // Return product with discount
    res.json({ product: { ...product, discount, },
    });
};
// POST /api/products
export const createProduct = async (req: Request, res: Response) => {
    const product = await prisma.product.create({data: req.body});
    res.status(201).json({ product });
}
//put/api/product-update
export const updateProduct = async (req: Request, res: Response) => {
    const product = await prisma.product.update({where: {id :req.params.id as string},data:req.body});
    res.json({ product });
}
//delete/api/prouct-delete
export const deleteProduct = async (req: Request, res: Response) => {
     await prisma.product.delete({where : {id : req.params.id as string}});
    res.json({ message: "Delete" });
}