import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/database'
import { verifyToken } from '@/lib/auth'

// Helper: decode the custom Base64 + jumbled parts encoding
function decodeFlag(encoded: string): string | null {
  if (!encoded || typeof encoded !== 'string') return null
  // If the client wrapped the encoded payload in CTF{...}, extract the inner content first
  const wrapperMatch = encoded.match(/^CTF\{([\s\S]+)\}$/)
  if (wrapperMatch) {
    encoded = wrapperMatch[1]
  }
  // Step 1: Add missing Base64 padding
  let input = encoded
  const mod = input.length % 4
  if (mod !== 0) {
    input += '='.repeat(4 - mod)
  }

  // Step 2: Base64 decode (UTF-8)
  let decodedStr: string
  try {
    decodedStr = Buffer.from(input, 'base64').toString('utf8')
  } catch (err) {
    return null
  }

  const len = decodedStr.length

  // Step 3: Calculate original part lengths (index % 3 split)
  const part1_len = Math.floor((len + 2) / 3)
  const part2_len = Math.floor((len + 1) / 3)
  const part3_len = Math.floor(len / 3)

  // Step 4: Extract parts in the order they were jumbled (part2 + part3 + part1)
  const part2 = decodedStr.slice(0, part2_len)
  const part3 = decodedStr.slice(part2_len, part2_len + part3_len)
  const part1 = decodedStr.slice(part2_len + part3_len, part2_len + part3_len + part1_len)

  // Step 5: Rebuild original based on index % 3 distribution
  let original = ''
  let i1 = 0, i2 = 0, i3 = 0
  for (let i = 0; i < len; i++) {
    const mod3 = i % 3
    if (mod3 === 0) {
      original += part1[i1++] || ''
    } else if (mod3 === 1) {
      original += part2[i2++] || ''
    } else {
      original += part3[i3++] || ''
    }
  }

  // return first half of the original string
  const halfLength = Math.floor(original.length / 2)
  return original.slice(0, halfLength)
}

// export async function POST(request: NextRequest) {
//   try {
//     const token = request.cookies.get('auth-token')?.value
//     const decoded = await verifyToken(token || '')

//     if (!decoded) {
//       return NextResponse.json(
//         { error: 'Unauthorized' },
//         { status: 401 }
//       )
//     }

//     const { challengeId, flag } = await request.json()

//     if (!challengeId || !flag) {
//       return NextResponse.json(
//         { error: 'Challenge ID and flag are required' },
//         { status: 400 }
//       )
//     }

//     // Get the challenge
//     const challenge = await Database.getChallengeById(challengeId)
//     if (!challenge) {
//       return NextResponse.json(
//         { error: 'Challenge not found' },
//         { status: 404 }
//       )
//     }

//     // Check if user already solved this challenge
//     if (challenge.solvedBy?.includes(decoded.username)) {
//       return NextResponse.json(
//         { error: 'You have already solved this challenge' },
//         { status: 400 }
//       )
//     }

//     // Check if the flag is correct
//     const isCorrect = flag.trim() === challenge.flag.trim()

//     // Create submission record
//     await Database.createSubmission({
//       challengeId,
//       userId: decoded.id,
//       username: decoded.username,
//       submittedFlag: flag,
//       isCorrect
//     })

//     if (isCorrect) {
//       // Update user score and solved challenges
//       await Database.updateUserScore(decoded.id, challenge.points)
//       await Database.addSolvedChallenge(decoded.id, challengeId)
      
//       // Add user to challenge's solved list
//       await Database.addSolverToChallenge(challengeId, decoded.username)

//       return NextResponse.json({
//         correct: true,
//         message: 'Correct flag!',
//         points: challenge.points
//       })
//     } else {
//       return NextResponse.json({
//         correct: false,
//         message: 'Incorrect flag'
//       })
//     }
//   } catch (error) {
//     console.error('Error submitting flag:', error)
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     )
//   }
// }


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

    const { challengeId, flag: encodedFlag } = await request.json()

    const decodedFlag = decodeFlag(encodedFlag)
    if (!decodedFlag) {
      return NextResponse.json({ error: 'Flag decoding failed' }, { status: 400 })
    }

    // return NextResponse.json({ decodedFlag })

    if (!challengeId || !encodedFlag) {
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

    // Check if the decoded flag is correct
    const isCorrect = decodedFlag.trim() === challenge.flag.trim()
    // If correct, ensure this exact flag hasn't already been submitted for this challenge
    if (isCorrect) {
      const submissionsColl = await Database.getSubmissions()
      const existing = await submissionsColl.findOne({ challengeId, isCorrect: true, submittedFlag: encodedFlag })
      if (existing) {
        return NextResponse.json({ error: 'This flag has already been submitted' }, { status: 400 })
      }
    }

    // Create submission record (store decoded flag)
    await Database.createSubmission({
      challengeId,
      userId: decoded.id,
      username: decoded.username,
      submittedFlag: encodedFlag,
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