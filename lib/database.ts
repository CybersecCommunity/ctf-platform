import clientPromise from './mongodb'
import { User } from './models/User'
import { Challenge, ChallengeSubmission } from './models/Challenge'
import { ObjectId } from 'mongodb'

export class Database {
  static async getUsers() {
    const client = await clientPromise
    const db = client.db()
    return db.collection<User>('users')
  }

  static async getChallenges() {
    const client = await clientPromise
    const db = client.db()
    return db.collection<Challenge>('challenges')
  }

  static async getSubmissions() {
    const client = await clientPromise
    const db = client.db()
    return db.collection<ChallengeSubmission>('submissions')
  }

  // User operations
  static async createUser(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>) {
    const users = await this.getUsers()
    const now = new Date()
    
    const user: Omit<User, '_id'> = {
      ...userData,
      createdAt: now,
      updatedAt: now
    }
    
    const result = await users.insertOne(user)
    return { ...user, _id: result.insertedId }
  }

  static async findUserByEmail(email: string) {
    const users = await this.getUsers()
    return users.findOne({ email })
  }

  static async findUserByUsername(username: string) {
    const users = await this.getUsers()
    return users.findOne({ username })
  }

  static async findUserById(id: string) {
    const users = await this.getUsers()
    return users.findOne({ _id: new ObjectId(id) })
  }

  static async updateUserScore(userId: string, points: number) {
    const users = await this.getUsers()
    return users.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $inc: { score: points },
        $set: { updatedAt: new Date() }
      }
    )
  }

  static async addSolvedChallenge(userId: string, challengeId: string) {
    const users = await this.getUsers()
    return users.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $addToSet: { solvedChallenges: challengeId },
        $set: { updatedAt: new Date() }
      }
    )
  }

  // Challenge operations
  static async getAllChallenges() {
    const challenges = await this.getChallenges()
    return challenges.find({ isActive: true }).toArray()
  }

  static async getChallengeById(id: string) {
    const challenges = await this.getChallenges()
    return challenges.findOne({ _id: new ObjectId(id) })
  }

  static async createChallenge(challengeData: Omit<Challenge, '_id' | 'createdAt' | 'updatedAt'>) {
    const challenges = await this.getChallenges()
    const now = new Date()
    
    const challenge: Omit<Challenge, '_id'> = {
      ...challengeData,
      createdAt: now,
      updatedAt: now
    }
    
    const result = await challenges.insertOne(challenge)
    return { ...challenge, _id: result.insertedId }
  }

  static async addSolverToChallenge(challengeId: string, username: string) {
    const challenges = await this.getChallenges()
    return challenges.updateOne(
      { _id: new ObjectId(challengeId) },
      { 
        $addToSet: { solvedBy: username },
        $set: { updatedAt: new Date() }
      }
    )
  }

  // Submission operations
  static async createSubmission(submissionData: Omit<ChallengeSubmission, '_id' | 'submittedAt'>) {
    const submissions = await this.getSubmissions()
    
    const submission: Omit<ChallengeSubmission, '_id'> = {
      ...submissionData,
      submittedAt: new Date()
    }
    
    const result = await submissions.insertOne(submission)
    return { ...submission, _id: result.insertedId }
  }

  static async getLeaderboard() {
    const users = await this.getUsers()
    return users
      .find({ role: 'participant' })
      .sort({ score: -1, updatedAt: 1 })
      .limit(10)
      .toArray()
  }
}