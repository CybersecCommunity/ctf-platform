import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/database'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    const decoded = await verifyToken(token || '')

    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { challengeId, flag } = await request.json()

    if (!challengeId || !flag) {
      return NextResponse.json(
        { error: 'Challenge ID and flag are required' },
        { status: 400 }
      )
    }

    // Get the challenge
    const challenge = await Database.getChallengeById(challengeId)
    if (!challenge) {
      return NextResponse.json(
        { error: 'Challenge not found' },
        { status: 404 }
      )
    }

    // Check if user already solved this challenge
    if (challenge.solvedBy?.includes(decoded.username)) {
      return NextResponse.json(
        { error: 'You have already solved this challenge' },
        { status: 400 }
      )
    }

    // Check if the flag is correct
    const isCorrect = flag.trim() === challenge.flag.trim()

    // Create submission record
    await Database.createSubmission({
      challengeId,
      userId: decoded.id,
      username: decoded.username,
      submittedFlag: flag,
      isCorrect
    })

    if (isCorrect) {
      // Update user score and solved challenges
      await Database.updateUserScore(decoded.id, challenge.points)
      await Database.addSolvedChallenge(decoded.id, challengeId)
      
      // Add user to challenge's solved list
      await Database.addSolverToChallenge(challengeId, decoded.username)

      return NextResponse.json({
        correct: true,
        message: 'Correct flag!',
        points: challenge.points
      })
    } else {
      return NextResponse.json({
        correct: false,
        message: 'Incorrect flag'
      })
    }
  } catch (error) {
    console.error('Error submitting flag:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}