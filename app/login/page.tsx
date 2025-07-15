// 'use client'

// import { useState } from 'react'
// import { useRouter } from 'next/navigation'
// import Link from 'next/link'
// import { Shield, Eye, EyeOff } from 'lucide-react'

// export default function LoginPage() {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: ''
//   })
//   const [showPassword, setShowPassword] = useState(false)
//   const [error, setError] = useState('')
//   const [loading, setLoading] = useState(false)
//   const router = useRouter()

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setLoading(true)
//     setError('')

//     try {
//       console.log("logging in")
//       const response = await fetch('/api/auth/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(formData),
//       })

//       const data = await response.json()
//       console.log(data)
//       console.log(response.ok)

//       if (response.ok) {
//         router.push('/dashboard')
//       } else {
//         setError(data.error || 'Login failed')
//       }
//     } catch (err) {
//       setError('An error occurred. Please try again.')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData(prev => ({
//       ...prev,
//       [e.target.name]: e.target.value
//     }))
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
//       <div className="max-w-md w-full">
//         <div className="card animate-fade-in">
//           <div className="text-center mb-8">
//             <Shield className="h-12 w-12 text-primary-600 mx-auto mb-4" />
//             <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
//             <p className="text-gray-600 mt-2">Sign in to your CTF account</p>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-6">
//             {error && (
//               <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg">
//                 {error}
//               </div>
//             )}

//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
//                 Email Address
//               </label>
//               <input
//                 type="email"
//                 id="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 className="input-field"
//                 placeholder="Enter your email"
//                 required
//               />
//             </div>

//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
//                 Password
//               </label>
//               <div className="relative">
//                 <input
//                   type={showPassword ? 'text' : 'password'}
//                   id="password"
//                   name="password"
//                   value={formData.password}
//                   onChange={handleChange}
//                   className="input-field pr-10"
//                   placeholder="Enter your password"
//                   required
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                 >
//                   {showPassword ? (
//                     <EyeOff className="h-5 w-5 text-gray-400" />
//                   ) : (
//                     <Eye className="h-5 w-5 text-gray-400" />
//                   )}
//                 </button>
//               </div>
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {loading ? 'Signing In...' : 'Sign In'}
//             </button>
//           </form>

//           <div className="mt-6 text-center">
//             <p className="text-gray-600">
//               Don't have an account?{' '}
//               <Link href="/register" className="text-primary-600 hover:text-primary-700 font-medium">
//                 Sign up
//               </Link>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
'use client'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="card animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Login Page</h1>
            <p className="text-gray-600 mt-2">This is a placeholder for the login functionality.</p>
          </div>
          <p className="text-center text-gray-600">Login functionality will be implemented soon.</p>
        </div>
      </div>
    </div>
  )
}