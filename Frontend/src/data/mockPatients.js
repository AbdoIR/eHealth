/**
 * mockPatients.js
 * Centralised patient registry — single source of truth for mock data.
 * Replace this module's contents with a blockchain/API call when the
 * back-end is ready; all hooks and components will update automatically.
 */
export const MOCK_PATIENTS = [
  {
    id: 'P-1001',
    name: 'James Richards',
    dob: '1988-03-14',
    gender: 'Male',
    bloodType: 'A+',
    phone: '+1 555-0101',
    email: 'james.r@example.com',
    primaryCondition: 'Hypertension',
    status: 'Active',
  },
  {
    id: 'P-1002',
    name: 'Emma Torres',
    dob: '1995-07-22',
    gender: 'Female',
    bloodType: 'O-',
    phone: '+1 555-0102',
    email: 'patient@meddesk.health',
    primaryCondition: 'Type 2 Diabetes',
    status: 'Active',
  },
  {
    id: 'P-1003',
    name: 'Liam Chen',
    dob: '1972-11-05',
    gender: 'Male',
    bloodType: 'B+',
    phone: '+1 555-0103',
    email: 'liam.c@example.com',
    primaryCondition: 'Post-op Recovery',
    status: 'Discharged',
  },
  {
    id: 'P-1004',
    name: 'Sophia Patel',
    dob: '2001-01-30',
    gender: 'Female',
    bloodType: 'AB+',
    phone: '+1 555-0104',
    email: 'sophia.p@example.com',
    primaryCondition: 'Asthma',
    status: 'Active',
  },
  {
    id: 'P-1005',
    name: 'Noah Williams',
    dob: '1965-09-18',
    gender: 'Male',
    bloodType: 'O+',
    phone: '+1 555-0105',
    email: 'noah.w@example.com',
    primaryCondition: 'Chronic Kidney Disease',
    status: 'Critical',
  },
]
