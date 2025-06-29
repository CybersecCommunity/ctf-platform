import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/database'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token || !(await verifyToken(token))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const challenges = await Database.getAllChallenges()
    
    // Remove the flag from the response for security
    const safeChallenges = challenges.map(challenge => {
      const { flag, ...safeChallenge } = challenge
      return safeChallenge
    })

    return NextResponse.json(safeChallenges)
  } catch (error) {
    console.error('Error fetching challenges:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    const decoded = await verifyToken(token || '')

    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const challengeData = await request.json()
    
    const challenge = await Database.createChallenge({
      ...challengeData,
      solvedBy: [],
      isActive: true
    })

    return NextResponse.json(challenge, { status: 201 })
  } catch (error) {
    console.error('Error creating challenge:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}