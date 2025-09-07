
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HiddenFlagPage() {
  const [verified, setVerified] = useState(false)
  const [checking, setChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (!res.ok) {
          router.replace('/login')
          return
        }
        const user = await res.json()
        if (user.username === 'rock_andre_06') {
          setVerified(true)
        } else {
          router.replace('/dashboard')
          return
        }
      } catch (err) {
        router.replace('/login')
        return
      } finally {
        setChecking(false)
      }
    }
    checkUser()
  }, [router])

  if (checking || !verified) {
    return null
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.replace('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold">🎉 Flag Found!</h1>
        <p className="mt-4">
          {"CTF{hide_your_digital_signature}"}
        </p>
        <button
          onClick={handleLogout}
          className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
    </div>
  )
}
