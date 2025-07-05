import { NextResponse } from 'next/server'

export async function GET() {
  // This would normally be protected, but for the XSS challenge it's intentionally accessible
  return NextResponse.json({ 
    flag: 'CTF{xss_can_steal_secrets}' 
  })
}