import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Stethoscope, AlertCircle } from 'lucide-react'
import { Button, Card, CardBody } from '@heroui/react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setError('')
    setLoading(true)
    
    const result = await login()
    
    setLoading(false)
    if (result.ok) {
      // Redirect based on role, ignoring any previous 'from' path
      const destination = result.userType === 'patient' ? '/my-history' : '/'
      navigate(destination, { replace: true })
    } else {
      setError(result.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-clinical-600 mb-4 shadow-lg">
            <Stethoscope className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">MedDesk</h1>
          <p className="text-sm text-slate-500 mt-1">Blockchain Clinical Platform</p>
        </div>

        {/* Card */}
        <Card shadow="sm" className="border border-slate-200 dark:border-slate-700">
          <CardBody className="p-8">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">Access your account</h2>
            <p className="text-sm text-slate-400 mb-6">Connect your Web3 wallet to continue.</p>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm px-4 py-3 rounded-lg mb-5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <Button
              onPress={handleLogin}
              isLoading={loading}
              className="w-full bg-[#F6851B] hover:bg-[#E2761B] text-white font-semibold mt-2"
              size="lg"
            >
              {loading ? 'Connecting...' : 'Connect MetaMask'}
            </Button>
            <p className="text-xs text-center text-slate-400 mt-4">
              Requires the MetaMask browser extension.
            </p>
          </CardBody>
        </Card>

        {/* Sign up link */}
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-5">
          Not registered yet?{' '}
          <Link to="/signup" className="text-clinical-600 font-semibold hover:text-clinical-800 transition">
            Create account
          </Link>
        </p>
      </div>
    </div>
  )
}
