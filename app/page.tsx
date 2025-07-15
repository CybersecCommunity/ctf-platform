import Link from 'next/link'
import { Shield, Trophy, Users, Zap } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Shield className="h-16 w-16 text-primary-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            CTF Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Test your cybersecurity skills in our Capture The Flag competition. 
            Solve challenges, earn points, and climb the leaderboard. Will be available from <strong>16th July 2025, 12 AM</strong>.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login" className="btn-primary text-lg px-8 py-3">
              Get Started
            </Link>
            <Link href="/register" className="btn-secondary text-lg px-8 py-3">
              Sign Up
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="card text-center">
            <Trophy className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Compete</h3>
            <p className="text-gray-600">
              Challenge yourself with various cybersecurity puzzles and earn points for each solved challenge.
            </p>
          </div>
          
          <div className="card text-center">
            <Users className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Leaderboard</h3>
            <p className="text-gray-600">
              Track your progress and see how you rank against other participants in real-time.
            </p>
          </div>
          
          <div className="card text-center">
            <Zap className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Learn</h3>
            <p className="text-gray-600">
              Improve your skills with challenges ranging from beginner to expert level.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}