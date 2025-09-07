"use client"
import { useState, useEffect } from 'react'

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        })
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

function getAdminSession() {
  if (typeof document === 'undefined') return null
  const cookieValue = document.cookie.split('; ').find(row => row.startsWith('admin-token='))?.split('=')[1]
  if (!cookieValue) return null
  return parseJwt(cookieValue)
}

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [checked, setChecked] = useState(false)
  const [role, setRole] = useState("participant")

  useEffect(() => {
    setIsAdmin(role === 'admin')
    setChecked(true)
  }, [])

  const handleAccessConsole = async () => {
    const data = await fetch('/api/admin/set-cookie', { method: 'POST' })
    const json = await data.json()
    setRole(json.role)
    setChecked(true)
  }

  return (
    <div className="min-h-screen bg-gray-100 relative">
      <a
        href="/dashboard"
        className="absolute top-6 left-6 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition"
        style={{ textDecoration: 'none' }}
      >
        Back to Dashboard
      </a>
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          {checked && (role === 'admin') ? (
            <>
              <h1 className="text-3xl font-bold text-green-700">WELCOME</h1>
              <p className="mt-4 text-xl text-black">{"CTF{forged_jwt_access}"}</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-red-600 mb-4">Not Allowed</h1>
              <button
                onClick={handleAccessConsole}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Access Console
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
