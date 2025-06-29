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

    const leaderboard = await Database.getLeaderboard()
    
    // Remove sensitive information
    const safeLeaderboard = leaderboard.map(user => ({
      _id: user._id,
      username: user.username,
      score: user.score,
      solvedChallenges: user.solvedChallenges
    }))

    return NextResponse.json(safeLeaderboard)
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}