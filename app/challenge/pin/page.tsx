'use client'
import { useState } from 'react'

export default function PinChallengePage() {
  const [pin, setPin] = useState('')
  const [result, setResult] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch('https://sqli-challenge-production.up.railway.app/check-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pin }),
      })

      const data = await res.json()
      console.log(data);
      
      setResult(`${data.message} (Status: ${res.status}) \n Flag : ${data.flag}`)
    } catch (err) {
      console.error('Error:', err)
      setResult('Error contacting backend API')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <h1 className="text-2xl font-bold mb-6">Crack the PIN Challenge</h1>
      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-xs">
        <input
          type="text"
          maxLength={4}
          pattern="\d{4}"
          placeholder="Enter 4-digit PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Submit PIN
        </button>
      </form>

      {result && (
        <div className="mt-6 p-4 bg-white border rounded shadow text-center">
          {result}
        </div>
      )}
    </div>
  )
}
