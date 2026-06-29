import { prisma } from "../config/prisma.js";
const admin = async (req, res, next) => {
    try {
        //only login user can axise the end point 
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "unauthorized" });
        }
        //user is exist or not
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: "user not found" });
        }
        const adminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.split(",")
            .map((e) => e.trim().toLowerCase()) : [];
        if (adminEmail.includes(user.email.toLowerCase())) {
            if (req.user)
                req.user.isAdmin = true;
            next();
        }
        else {
            res.status(403).json({ message: "Admin axies required" });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Admin verification failed", error: error.message });
    }
};
export default admin;
