import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { User, UserSession } from './models/User'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key-that-should-be-changed-in-production'
)

export async function generateToken(user: User): Promise<string> {
  const payload: UserSession = {
    id: user._id!.toString(),
    username: user.username,
    email: user.email,
    role: user.role,
    score: user.score,
    flag: 'CTF{you_can_decode_jwt_without_any_secret}'
  }
  
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as UserSession
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}