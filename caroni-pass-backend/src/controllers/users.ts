import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

import { TipoUsuario } from '@prisma/client';

export class UserController {

    static async getAll(req: Request, res: Response) {
        try {
            const users = await prisma.usuario.findMany({
                include: { cobros: true, recargas: true },
                orderBy: { createdAt: 'desc' },
            });
            return res.status(200).json(users);
        } catch (error) {
            console.error('Error al obtener todos los usuarios:', error);
            return res.status(500).json({ message: 'Error interno del servidor al consultar los usuarios' });
        }
    }

    static async getById(req: Request<{ id: string }>, res: Response): Promise<Response> {
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: 'El ID de usuario es requerido' });

        try {
            const user = await prisma.usuario.findUnique({
                where: { id },
                include: { cobros: true, recargas: true }
            });
            return res.status(200).json(user);
        } catch (error) {
            console.error('Error al obtener usuario por ID:', error);
            return res.status(500).json({ message: 'Error interno del servidor al consultar el usuario' });
        }
    }

    static async create(req: Request, res: Response): Promise<Response> {
        const nombre = req.body.nombre as string;
        const tipoUsuario = req.body.tipoUsuario as string;
        const email = req.body.email as string;
        const password = req.body.password as string;
        const saldoInput = req.body.saldo;

        if (!nombre || !email || !password) {
            return res.status(400).json({ message: 'Los campos "nombre", "password" y "email" son obligatorios' });
        }

        try {
            const existingUser = await prisma.usuario.findUnique({ where: { email } });
            if (existingUser) {
                return res.status(409).json({ message: 'El correo electrónico ya se encuentra registrado' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const parsedSaldo = typeof saldoInput === 'number' ? saldoInput : Number(saldoInput) || 0.0;

            const newUser = await prisma.usuario.create({
                data: { nombre,  tipoUsuario: tipoUsuario as TipoUsuario, email, password: hashedPassword, saldo: parsedSaldo },
                select: { id: true, nombre: true, tipoUsuario: true, email: true, saldo: true, createdAt: true }
            });
            
            return res.status(201).json(newUser);
        } catch (error) {
            console.error('Error al crear usuario:', error);
            return res.status(500).json({ message: 'Error interno del servidor al registrar el usuario' });
        }
    }

    static async login(req: Request, res: Response): Promise<Response> {
        const email = (req.body.email || req.params.email) as string;
        const password = (req.body.password || req.params.password) as string;

        if (!email || !password) {
            return res.status(400).json({ message: 'Los campos "email" y "password" son obligatorios' });
        }

        try {
            const user = await prisma.usuario.findUnique({ where: { email } });
            if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });

            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) return res.status(401).json({ message: 'Credenciales inválidas' });

            const secret = process.env.ACCESS_TOKEN_SECRET || 'secret_key_default';
            const token = jwt.sign({ id: user.id, tipoUsuario: user.tipoUsuario, email: user.email }, secret, { expiresIn: '24h' });

            res.cookie('token', token, {
                httpOnly: true,                    
                secure: process.env.NODE_ENV === 'production', 
                sameSite: 'lax',                  
                maxAge: 24 * 60 * 60 * 1000        
            });

            return res.status(200).json({
                message: 'Inicio de sesión exitoso',
                token,
                user: { id: user.id, tipoUsuario: user.tipoUsuario, nombre: user.nombre,  email: user.email, saldo: user.saldo }
            });
        } catch (error) {
            console.error('Error en el proceso de login:', error);
            return res.status(500).json({ message: 'Error interno del servidor al procesar la solicitud' });
        }
    }

    static async getSaldo(req: Request<{ id: string }>, res: Response): Promise<Response> {
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: 'El ID de usuario es requerido' });

        try {
            const user = await prisma.usuario.findUnique({
                where: { id },
                select: { saldo: true }
            });
            return res.status(200).json(user);
        } catch (error) {
            console.error('Error al obtener el saldo de usuario por ID:', error);
            return res.status(500).json({ message: 'Error interno del servidor al consultar el saldo de usuario' });
        }
    }

   static async update(req: Request<{ id: string }>, res: Response): Promise<Response> {
        const { id } = req.params;
        const { nombre, tipoUsuario, email, password, saldo } = req.body;

        try {
            const dataToUpdate: any = {};
            if (nombre) dataToUpdate.nombre = nombre;
            if (email) dataToUpdate.email = email;
            if (tipoUsuario) dataToUpdate.tipoUsuario = tipoUsuario as TipoUsuario;
            
            if (password && password.trim() !== '' && !password.startsWith('$2b$')) {
                dataToUpdate.password = await bcrypt.hash(password, 10);
            }

            if (saldo !== undefined) dataToUpdate.saldo = Number(saldo);

            const usuarioActualizado = await prisma.usuario.update({
                where: { id },
                data: dataToUpdate,
                select: { id: true, tipoUsuario: true, nombre: true, email: true, saldo: true }
            });
            return res.status(200).json({ success: true, data: usuarioActualizado });
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            return res.status(500).json({ success: false, message: 'Error al actualizar el usuario' });
        }
    }

    static async delete(req: Request<{ id: string }>, res: Response): Promise<Response> {
        const { id } = req.params;
        try {
            await prisma.usuario.delete({ where: { id } });
            return res.status(200).json({ success: true, message: 'Usuario eliminado exitosamente' });
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            return res.status(500).json({ success: false, message: 'Error al eliminar el usuario' });
        }
    }
}