import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Stethoscope, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button, Card, CardBody, RadioGroup, Radio, Input } from '@heroui/react'

export default function Signup() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [role, setRole] = useState('patient')
  const [doctorAddress, setDoctorAddress] = useState('')
  const [name, setName] = useState('')
  const [bloodType, setBloodType] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  
  // New clinic fields
  const [clinic, setClinic] = useState('')
  const [timezone, setTimezone] = useState('America/New_York')
  const [workingHoursStart, setWorkingHoursStart] = useState('08:00')
  const [workingHoursEnd, setWorkingHoursEnd] = useState('18:00')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister() {
    setError('')
    setSuccess('')
    setLoading(true)
    
    const result = await register({ 
        userType: role, 
        doctorAddress, 
        name, 
        bloodType, 
        phone, 
        email,
        clinic,
        timezone,
        workingHoursStart,
        workingHoursEnd
    })
    
    setLoading(false)
    if (result.ok) {
      if (role === 'doctor') {
         setDoctorAddress('')
         setSuccess('Doctor successfully added to the blockchain!')
      } else {
         navigate('/', { replace: true })
      }
    } else {
      setError(result.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-10">
      <div className="w-full max-w-md">
        {/* Brand */}
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
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">Register Account</h2>
            <p className="text-sm text-slate-400 mb-6">Choose your role and connect your Web3 wallet.</p>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm px-4 py-3 rounded-lg mb-5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
            
            {success && (
              <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:emerald-800 text-emerald-700 dark:text-emerald-300 text-sm px-4 py-3 rounded-lg mb-5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {success}
              </div>
            )}

            <div className="mb-6">
               <RadioGroup
                  label="I am registering as a:"
                  value={role}
                  onValueChange={setRole}
                  orientation="horizontal"
                  size="sm"
               >
                  <Radio value="patient">Patient</Radio>
                  <Radio value="doctor">Authorize Doctor</Radio>
               </RadioGroup>
            </div>

            {role === 'doctor' ? (
              <div className="mb-6 flex flex-col gap-6">
                 <Input
                   label="Doctor's Name"
                   value={name}
                   onValueChange={setName}
                   placeholder="e.g. Dr. Sarah Jenkins"
                   variant="bordered"
                   size="sm"
                   labelPlacement="outside"
                 />
                 <Input
                   label="Doctor's Ethereum Address"
                   value={doctorAddress}
                   onValueChange={setDoctorAddress}
                   placeholder="0x..."
                   variant="bordered"
                   size="sm"
                   labelPlacement="outside"
                 />
                 <Input
                   label="Clinic Name"
                   value={clinic}
                   onValueChange={setClinic}
                   placeholder="e.g. City General Hospital"
                   variant="bordered"
                   size="sm"
                   labelPlacement="outside"
                 />
                 <Input
                   label="Timezone"
                   value={timezone}
                   onValueChange={setTimezone}
                   placeholder="e.g. America/New_York"
                   variant="bordered"
                   size="sm"
                   labelPlacement="outside"
                 />
                 <div className="grid grid-cols-2 gap-4">
                     <Input
                       label="Shift Start"
                       type="time"
                       value={workingHoursStart}
                       onValueChange={setWorkingHoursStart}
                       variant="bordered"
                       size="sm"
                       labelPlacement="outside"
                     />
                     <Input
                       label="Shift End"
                       type="time"
                       value={workingHoursEnd}
                       onValueChange={setWorkingHoursEnd}
                       variant="bordered"
                       size="sm"
                       labelPlacement="outside"
                     />
                 </div>
                 <p className="text-xs text-clinical-600 mt-2 font-medium">Only the clinic admin (contract owner) can perform this action.</p>
              </div>
            ) : (
              <div className="mb-6 flex flex-col gap-6">
                 <Input
                   label="Full Name"
                   value={name}
                   onValueChange={setName}
                   placeholder="e.g. John Doe"
                   variant="bordered"
                   size="sm"
                   labelPlacement="outside"
                 />
                 <div className="grid grid-cols-2 gap-4">
                   <Input
                     label="Blood Type"
                     value={bloodType}
                     onValueChange={setBloodType}
                     placeholder="e.g. O+"
                     variant="bordered"
                     size="sm"
                     labelPlacement="outside"
                   />
                   <Input
                     label="Phone Number"
                     value={phone}
                     onValueChange={setPhone}
                     placeholder="(555) 123-4567"
                     variant="bordered"
                     size="sm"
                     labelPlacement="outside"
                   />
                 </div>
              </div>
            )}

            <Button
              onPress={handleRegister}
              isLoading={loading}
              className="w-full bg-[#F6851B] hover:bg-[#E2761B] text-white font-semibold mt-2"
              size="lg"
            >
              {loading ? 'Connecting...' : (role === 'doctor' ? 'Authorize via MetaMask' : 'Register via MetaMask')}
            </Button>
            
            <p className="text-xs text-center text-slate-400 mt-4">
              Requires MetaMask. {role === 'patient' ? 'Patient accounts involve an on-chain registration transaction.' : 'You must confirm the doctor authorization transaction.'}
            </p>
          </CardBody>
        </Card>

        {/* Sign in link */}
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-clinical-600 font-semibold hover:text-clinical-800 transition">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
