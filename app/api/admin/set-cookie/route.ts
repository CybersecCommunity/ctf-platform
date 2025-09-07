import { NextResponse } from 'next/server'
import { SignJWT, jwtVerify } from 'jose'

const ADMIN_JWT_SECRET = new TextEncoder().encode('S3cr3tK3yC0d3Tw0')

export async function POST(request) {
  const cookieHeader = request.cookies.get('admin-token')?.value
  let verified = false
  let role = 'participant'
  console.log('Received admin-token cookie:', cookieHeader)

  if (cookieHeader) {
    try {
      const { payload } = await jwtVerify(cookieHeader, ADMIN_JWT_SECRET)
      console.log('Payload:', payload)
  role = payload.role as string
      if (role === 'admin') {
        verified = true
      }
    } catch {
      // Invalid token, will reset below
    }
  }

  // If no cookie or invalid, set as participant
  if (!cookieHeader || !verified) {
    const token = await new SignJWT({ role: 'participant' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(ADMIN_JWT_SECRET)
    const response = NextResponse.json({ verified: false, role: 'participant' })
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    })
    return response
  }

  // If verified and admin
  return NextResponse.json({ verified: true, role: 'admin' })
}
