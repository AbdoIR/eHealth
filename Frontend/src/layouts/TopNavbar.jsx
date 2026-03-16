import { useNavigate } from 'react-router-dom'
import { Menu, LogOut, UserCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  Avatar,
  Button,
} from '@heroui/react'

import { getInitials } from '../utils/stringUtils'

/**
 * TopNavbar
 *
 * Props:
 *   onMenuClick — () => void — toggles the mobile sidebar
 */
export default function TopNavbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const userMenuClassNames = {
    base: 'min-w-[14rem] rounded-3xl border border-slate-200/90 bg-white/95 p-1.5 shadow-[0_18px_50px_-18px_rgba(15,23,42,0.35)] backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-900/95',
    list: 'gap-1.5',
  }

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 lg:px-6 shrink-0 relative z-10">

      {/* Left — hamburger (mobile) + page context */}
      <div className="flex items-center gap-3">
        <Button
          isIconOnly
          variant="light"
          onPress={onMenuClick}
          className="lg:hidden text-slate-500"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </Button>
        <span className="hidden sm:block text-sm text-slate-400 dark:text-slate-500 font-medium">
          {user.clinic}
        </span>
      </div>

      {/* Right — profile */}
      <div className="flex items-center gap-2">

        {/* ── User profile ── */}
        <Dropdown 
          placement="bottom-end"
          classNames={{
            content: "p-0 border-none bg-transparent shadow-none"
          }}
        >
          <DropdownTrigger>
            <button className="flex items-center gap-2.5 pl-1 pr-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors h-10 outline-none">
              <Avatar
                name={getInitials(user.name)}
                src={user.avatar}
                size="sm"
                className="bg-clinical-600 text-white text-xs font-semibold shrink-0"
              />
              <div className="hidden md:flex flex-col justify-center text-left h-full">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight">{user.name}</p>
                <p className="text-xs text-slate-400 leading-tight mt-0.5">{user.role}</p>
              </div>
            </button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="User actions"
            classNames={userMenuClassNames}
            itemClasses={{
              base: 'rounded-2xl px-3 py-2.5 text-slate-700 transition-colors data-[hover=true]:bg-slate-100 dark:text-slate-100 dark:data-[hover=true]:bg-slate-800',
            }}
            onAction={(key) => {
              if (key === 'profile') navigate('/settings')
              if (key === 'logout') logout()
            }}
          >
            <DropdownSection showDivider>
              <DropdownItem
                key="profile"
                startContent={<UserCircle size={16} />}
              >
                My Profile
              </DropdownItem>
            </DropdownSection>
            <DropdownSection>
              <DropdownItem
                key="logout"
                className="bg-danger-50 text-danger dark:bg-danger-950/40"
                color="danger"
                startContent={<LogOut size={16} />}
              >
                Log Out
              </DropdownItem>
            </DropdownSection>
          </DropdownMenu>
        </Dropdown>
      </div>
    </header>
  )
}
