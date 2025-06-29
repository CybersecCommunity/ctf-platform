import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/database'
import { hashPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json()

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUserByEmail = await Database.findUserByEmail(email)
    if (existingUserByEmail) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    const existingUserByUsername = await Database.findUserByUsername(username)
    if (existingUserByUsername) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 400 }
      )
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password)
    const user = await Database.createUser({
      username,
      email,
      password: hashedPassword,
      role: 'participant',
      score: 0,
      solvedChallenges: []
    })

    // Generate token
    const token = await generateToken(user)

    // Set cookie and return response
    const response = NextResponse.json(
      { message: 'User created successfully', user: { id: user._id, username, email, role: user.role, score: 0 } },
      { status: 201 }
    )

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}