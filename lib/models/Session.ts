import { ObjectId } from 'mongodb'

export interface Session {
  _id?: ObjectId;
  sessionId: string;
  state: string;
  createdAt?: Date;
}
