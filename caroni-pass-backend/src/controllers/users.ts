import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

export class  UserController {

    static async getAll(req: Request, res: Response) {
        try {
            const users = await prisma.usuario.findMany({
                include: {
                    cobros: true,
                    recargas: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

            return res.status(200).json(users);
        } catch (error) {
            console.error('Error al obtener todos los usuarios:', error);

            return res.status(500).json({
                message: 'Error interno del servidor al consultar los usuarios',
            });
        }
    }

    static async getById(req: Request<{ id: string }>, res: Response): Promise<Response> {
        const { id } = req.params;

        if(!id){
            return res.status(400).json({ message: 'El ID de usuario es requerido' });
        }

        try {
            const user = await prisma.usuario.findUnique({
                where: { id },
                include: { cobros: true, recargas: true }
            })

            if (user) return res.json(user)

            return res.status(200).json(user);
        } catch (error) {
            console.error('Error al obtener usuario por ID:', error);
            
            return res.status(500).json({ 
                message: 'Error interno del servidor al consultar el usuario' 
            });
        }
    }

    static async create(req: Request, res: Response): Promise<Response> {
        const { nombre, email, password, saldo } = req.params;

        if (!nombre || !email || !password) {
            return res.status(400).json({ 
                message: 'Los campos "nombre", "password" y "email" son obligatorios' 
            });
        }

        try {
            const existingUser = await prisma.usuario.findUnique({
                where: { email: email}
            });

            if(existingUser){
                return res.status(409).json({ 
                    message: 'El correo electrónico ya se encuentra registrado' 
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await prisma.usuario.create({
                data: {
                    nombre, 
                    email,
                    password: hashedPassword,
                    saldo: typeof saldo === 'number' ? saldo : 0.0,,

                },
                select: {
                    id: true,
                    nombre: true,
                    email: true,
                    saldo: true,
                    createdAt: true,
                }
            })
            
            return res.status(201).json(newUser);
        } catch (error) {
            console.error('Error al crear usuario:', error);

            return res.status(500).json({ 
                message: 'Error interno del servidor al registrar el usuario' 
            });
        }
    }

    static async login(req: Request, res: Response): Promise<Response>{
        const { email,  password } = req.params;

        if (!email || !password) {
            return res.status(400).json({ 
                message: 'Los campos "username" y "password" son obligatorios' 
            });
        }

        try {
            const user = await prisma.usuario.findUnique({
                where: { email }
            })

            if(!user) return res.status(401).json({ message: 'Credenciales inválidas' });

            const isValidPassword = await bcrypt.compare(password, user.password);

            if (!isValidPassword) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
            }

            const secret = process.env.ACCESS_TOKEN_SECRET || 'secret_key_default';
            const token = jwt.sign(
                { 
                id: user.id, 
                email: user.email 
                },
                secret,
                { expiresIn: '24h' }
            );

            return res
                .cookie('access_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                maxAge: 1000 * 60 * 60 * 24 
                })
                .status(200)
                .json({
                message: 'Inicio de sesión exitoso',
                user: {
                    id: user.id,
                    nombre: user.nombre,
                    email: user.email,
                    saldo: user.saldo
                }
                });

            } catch (error) {
                console.error('Error en el proceso de login:', error);
                return res.status(500).json({ 
                    message: 'Error interno del servidor al procesar la solicitud' 
                });
            }
        };


}