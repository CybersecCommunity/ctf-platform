'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, AlertTriangle, Shield } from 'lucide-react'

declare global {
  interface Window {
    revealTheFlag: () => void
  }
}

// Function to fetch and reveal the flag via API
async function revealTheFlag() {
  try {
    const response = await fetch('/api/xss-challenge/getFlag')
    const data = await response.json()
    const flag = data.flag
    
    // Create a more visible flag display
    const flagDiv = document.createElement('div')
    flagDiv.innerHTML = `
      <div style="position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 16px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 9999; font-family: monospace; font-weight: bold;">
        🚩 FLAG FOUND: ${flag}
      </div>
    `
    document.body.appendChild(flagDiv)
    
    alert('🚩 Flag found: ' + flag)
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (flagDiv.parentNode) {
        flagDiv.parentNode.removeChild(flagDiv)
      }
    }, 10000)
  } catch (error) {
    console.error('Error fetching flag:', error)
    alert('Error: Could not retrieve flag')
  }
}

if (typeof window !== 'undefined') {
  window.revealTheFlag = revealTheFlag
}

export default function XSSChallenge() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState('')
  const [user, setUser] = useState(null)
  const resultsRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    fetchUser()
  }, [])

  useEffect(() => {
    // This is the key workaround - manually inject the HTML after React renders
    if (result && resultsRef.current) {
      // Clear previous content
      resultsRef.current.innerHTML = ''
      
      // Create a temporary div to parse the HTML
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = result
      
      // Move all nodes from temp div to results div
      while (tempDiv.firstChild) {
        resultsRef.current.appendChild(tempDiv.firstChild)
      }
      
      // Execute any script tags that were added
      const scripts = resultsRef.current.querySelectorAll('script')
      scripts.forEach(script => {
        const newScript = document.createElement('script')
        newScript.textContent = script.textContent
        script.parentNode.replaceChild(newScript, script)
      })
    }
  }, [result])

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      router.push('/login')
    }
  }

  const handleSearch = () => {
    // Reflect user input completely unsanitized
    setResult(`<div>Search results for: <strong>${query}</strong></div>`)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="card mb-6">

            {/* Search Interface */}
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Vulnerable Search Interface
              </h3>
              
              <div className="space-y-4">
                <div className="flex space-x-4">
                    <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter your search query..."
                    className="flex-1 input-field"
                    />
                    <button
                    onClick={handleSearch}
                    className="btn-primary"
                    >
                    Search
                    </button>
                </div>

                {/* Search Results - Vulnerable to XSS */}
                {result && (
                    <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Search Results:</h4>
                    <div
                        ref={resultsRef}
                        className="prose text-gray-700 min-h-[2rem]"
                        style={{ 
                        wordBreak: 'break-word',
                        whiteSpace: 'normal'
                        }}
                    />
                    </div>
                )}
                </div>
          </div>
        </div>
      </div>
    </div>
  )
}