'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Trophy, Users, LogOut, Flag, Star } from 'lucide-react'
import { Challenge } from '@/lib/models/Challenge'
import { UserSession } from '@/lib/models/User'

export default function DashboardPage() {
  const [user, setUser] = useState<UserSession | null>(null)
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'challenges' | 'leaderboard'>('challenges')
  const router = useRouter()

  useEffect(() => {
    fetchUserData()
    fetchChallenges()
    fetchLeaderboard()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      router.push('/login')
    }
  }

  const fetchChallenges = async () => {
    try {
      const response = await fetch('/api/challenges')
      if (response.ok) {
        const challengesData = await response.json()
        setChallenges(challengesData)
      }
    } catch (error) {
      console.error('Error fetching challenges:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard')
      if (response.ok) {
        const leaderboardData = await response.json()
        setLeaderboard(leaderboardData)
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-success-600 bg-success-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'hard': return 'text-danger-600 bg-danger-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = [
      'text-blue-600 bg-blue-50',
      'text-purple-600 bg-purple-50',
      'text-green-600 bg-green-50',
      'text-red-600 bg-red-50',
      'text-indigo-600 bg-indigo-50'
    ]
    return colors[category.length % colors.length]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hidden flag for the "Hidden in HTML" challenge */}
      {/* CTF{view_source_is_useful} */}
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">CTF Platform</h1>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold text-gray-900">{user?.score || 0} points</span>
              </div>
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-medium">{user?.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Your Score</p>
                <p className="text-2xl font-bold text-gray-900">{user?.score || 0}</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Challenges Solved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {challenges.filter(c => c.solvedBy?.includes(user?.username || '')).length}
                </p>
              </div>
              <Flag className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Challenges</p>
                <p className="text-2xl font-bold text-gray-900">{challenges.length}</p>
              </div>
              <Star className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('challenges')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'challenges'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Challenges
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'leaderboard'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Leaderboard
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'challenges' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge) => {
              const isSolved = challenge.solvedBy?.includes(user?.username || '')
              return (
                <div key={challenge._id?.toString()} className="card hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{challenge.title}</h3>
                    {isSolved && (
                      <div className="bg-success-100 text-success-800 px-2 py-1 rounded-full text-xs font-medium">
                        Solved
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-4 text-sm">{challenge.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                        {challenge.difficulty}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(challenge.category)}`}>
                        {challenge.category}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">{challenge.points}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{challenge.solvedBy?.length || 0} solves</span>
                    <button
                      onClick={() => router.push(`/challenge/${challenge._id}`)}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      View Challenge
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Leaderboard
            </h3>
            <div className="space-y-4">
              {leaderboard.map((participant, index) => (
                <div key={participant._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{participant.username}</p>
                      <p className="text-sm text-gray-500">{participant.solvedChallenges?.length || 0} challenges solved</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="font-semibold text-gray-900">{participant.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}