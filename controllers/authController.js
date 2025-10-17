// controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const register = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Usuario ya registrado' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword, name });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Credenciales inválidas' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Credenciales inválidas' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

// ✅ Actualiza datos del perfil y dirección
export const updateProfile = async (req, res) => {
  try {
    const {
      name,
      lastName,
      document,
      gender,
      phone,
      birthdate,
      address,
    } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        name,
        lastName,
        document,
        gender,
        phone,
        birthdate,
        address,
      },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error actualizando perfil' });
  }
};

// ✅ Cambiar contraseña
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Contraseña actual incorrecta' });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al cambiar contraseña' });
  }
};
