import { ObjectId } from 'mongodb'

export interface User {
  _id?: ObjectId
  username: string
  email: string
  password: string
  role: 'admin' | 'participant'
  score: number
  solvedChallenges: string[]
  createdAt: Date
  updatedAt: Date
}

export interface UserSession {
  id: string
  username: string
  email: string
  role: 'admin' | 'participant'
  score: number
  flag: string
}