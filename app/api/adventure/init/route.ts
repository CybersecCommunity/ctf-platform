// app/api/adventure/init/route.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: NextRequest) {
  const client = await clientPromise;
  const db = client.db('test');
  const sessions = db.collection('api_adventure_sessions');

  const sessionId = uuidv4();

  await sessions.insertOne({
    sessionId,
    state: 'entrance',
    createdAt: new Date(),
  });

  const res = NextResponse.json({ message: 'Adventure begins!', sessionId });
  res.cookies.set('sessionId', sessionId, {
    httpOnly: true,
    path: '/',
  });

  return res;
}
