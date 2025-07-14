// app/api/adventure/route.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Session } from '@/lib/models/Session';

const TRANSITIONS: Record<string, Record<string, string>> = {
  entrance: {
    enter: 'hall',
    knock: 'entrance',
    look_around: 'trap_1',
    sit: 'lounge',
  },
  hall: {
    open_door: 'maze',
    inspect: 'chamber',
    touch_wall: 'trap_2',
    run_back: 'entrance',
  },
  lounge: {
    nap: 'trap_3',
    whistle: 'lounge',
    drink_water: 'hallway_dream',
    back: 'entrance'
  },
  hallway_dream: {
    follow_ghost: 'void_loop',
    back: 'lounge',
  },
  void_loop: {
    walk: 'void_loop',
    shout: 'void_loop',
    sleep: 'lounge',
  },
  maze: {
    go_left: 'dead_end_1',
    go_right: 'chamber',
    go_straight: 'trap_4',
  },
  dead_end_1: {
    back: 'maze',
  },
  chamber: {
    press_button: 'trap_5',
    back: 'hall',
    search: 'hidden_room',
    offer_coin: 'passage',
  },
  hidden_room: {
    take_map: 'chamber',
    meditate: 'void_loop',
  },
  passage: {
    crawl: 'trap_6',
    cut_vines: 'sanctum',
    back: 'chamber',
  },
  sanctum: {
    take_flag: 'flag',
    sneeze: 'trap_7',
    back: 'passage',
  },
  trap_1: {}, trap_2: {}, trap_3: {}, trap_4: {},
  trap_5: {}, trap_6: {}, trap_7: {},
};

const STORY_TEXT: Record<string, string> = {
  entrance: 'You stand before the moss-covered temple entrance.',
  hall: 'A dim hallway stretches forward, humming with old magic.',
  lounge: 'A warm room with cushions. Strangely comfortable...',
  hallway_dream: 'A surreal corridor appears before your eyes.',
  void_loop: 'You’re floating in nothing. Time feels... slow.',
  maze: 'Twisting passages confuse your sense of direction.',
  dead_end_1: 'You hit a dead end. Literally.',
  chamber: 'A room with three glowing altars.',
  hidden_room: 'A dusty chamber with ancient scrolls.',
  passage: 'Vines choke the narrow path ahead.',
  sanctum: 'A radiant room. The flag hovers above a pedestal.',
  flag: 'The temple shakes. You grasp the flag. Victory is yours!',
};

const TRAP_TEXT: Record<string, string> = {
  trap_1: 'A hidden spear trap fires! You retreat, shaken.',
  trap_2: 'Darts fly from the wall. Close call!',
  trap_3: 'You nap. Spirits are displeased. You’re thrown out.',
  trap_4: 'A pit opens! You barely escape death.',
  trap_5: 'Pressing the button triggers a boulder!',
  trap_6: 'Crawling leads to darkness. And teeth.',
  trap_7: 'Your sneeze awakens something old. It throws you out.',
};

export async function POST(req: NextRequest) {
  const client = await clientPromise;
  const db = client.db('test');
  const sessions = db.collection<Session>('api_adventure_sessions');

  const cookie = req.cookies.get('sessionId');
  if (!cookie) {
    return NextResponse.json(
      { error: 'No session found. Visit /api/adventure/init first.' },
      { status: 401 }
    );
  }

  const session = await sessions.findOne({ sessionId: cookie.value });
  if (!session) {
    return NextResponse.json({ error: 'Session not found.' }, { status: 404 });
  }

  const currentState = session.state;
  let act: string | undefined;

  // Parse JSON body (or detect empty)
  let bodyText = '';
  try {
    bodyText = await req.text();
  } catch (err) {
    return NextResponse.json({ error: 'Send a body with the request in the format {"act": one_of_possible_actions}' }, { status: 400 });
  }

  if (!bodyText) {
    // No action provided — just return info about the current state
    return NextResponse.json({
      story: STORY_TEXT[currentState] || 'You are somewhere unknown.',
      state: currentState,
      options: Object.keys(TRANSITIONS[currentState] || {}),
      hint: "Send a JSON body with {'act': 'your_action_here'} to interact.",
    });
  }

  try {
    const body = JSON.parse(bodyText);
    act = body.act;
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON format.' }, { status: 400 });
  }

  if (!act || typeof act !== 'string') {
    return NextResponse.json({
      error: 'Missing or invalid "act" field.',
      state: currentState,
      story: STORY_TEXT[currentState] || '',
      options: Object.keys(TRANSITIONS[currentState] || {}),
    }, { status: 400 });
  }

  const nextState = TRANSITIONS[currentState]?.[act];
  if (!nextState) {
    return NextResponse.json({
      error: `Invalid action "${act}" from "${currentState}".`,
      options: Object.keys(TRANSITIONS[currentState] || {}),
      state: currentState,
      story: STORY_TEXT[currentState] || '',
    }, { status: 400 });
  }

  if (nextState.startsWith('trap_')) {
    await sessions.updateOne({ sessionId: session.sessionId }, { $set: { state: 'entrance' } });
    return NextResponse.json({
      trap: TRAP_TEXT[nextState],
      reset: 'You were caught in a trap and returned to the entrance.',
      state: 'entrance',
      options: Object.keys(TRANSITIONS['entrance']),
      story: STORY_TEXT['entrance'],
    });
  }

  await sessions.updateOne({ sessionId: session.sessionId }, { $set: { state: nextState } });

  if (nextState === 'flag') {
    return NextResponse.json({
      flag: 'CTF{you_survived_the_temple_of_flags}',
      story: STORY_TEXT[nextState],
    });
  }

  return NextResponse.json({
    story: STORY_TEXT[nextState] || 'You move forward.',
    state: nextState,
    options: Object.keys(TRANSITIONS[nextState] || {}),
  });
}
