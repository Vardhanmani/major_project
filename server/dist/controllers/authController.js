import { prisma } from "../config/prisma.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
//generate jwt token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};
//check if user or admin
const getAddminStatus = (email) => {
    if (!email)
        return false;
    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(",").map((e) => e.trim().toLowerCase()) : [];
    return adminEmails.includes(email.toLowerCase());
};
//register
//post /api/auth/reqister
export const register = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: "please provide all fields" });
    }
    //if existing
    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingUser) {
        return res.status(400).json({ message: "user allreay exists with is email" });
    }
    //if not existing
    const hashedPassword = await bcrypt.hash(password, 10);
    //indatabase
    const user = await prisma.user.create({
        data: { name, email: email.toLowerCase, password: hashedPassword }
    });
    //get token
    const token = generateToken(user.id);
    //sending responce
    const userData = { ...user };
    delete userData.password;
    userData.isAdmin = getAddminStatus(userData.email);
    res.status(201).json({ user: userData, token });
};
//login
//post /api/auth/login
export const login = async (req, res) => {
    const { name, email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "please provide email & password" });
    }
    //Does the user exist?
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() }, include: { addresses: true } });
    if (!user) {
        return res.status(401).json({ message: "invalide email or password" });
    }
    //Is the password correct?
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: "Invalide email or password" });
    }
    //Generate a JWT token for the authenticated user
    const token = generateToken(user.id);
    //sending responce
    const userData = { ...user };
    delete userData.password;
    userData.isAdmin = getAddminStatus(userData.email);
    res.json({ user: userData, token });
};
