import { UserRole, ToolStatus, LoanStatus, RequestStatus, NotificationType } from '@prisma/client'

export interface UserSafe {
  id: number
  name: string
  email: string
  carnet: string | null
  phone: string | null
  photo: string | null
  career: string
  workshop: string | null
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
  career: string
}

export interface AuthResponse {
  token: string
  user: UserSafe
}

export interface ToolFilters {
  cat?: string
  career?: string
  search?: string
  status?: ToolStatus
}

export interface CreateToolInput {
  name: string
  cat: string
  code: string
  desc?: string
  brand?: string
  location: string
  totalQty: number
  available: number
  image?: string
  maxDays?: number
  specs?: Record<string, string>
  careers: string[]
  categoryId?: number
}

export interface UpdateToolInput {
  name?: string
  cat?: string
  code?: string
  desc?: string
  brand?: string
  location?: string
  totalQty?: number
  available?: number
  image?: string
  maxDays?: number
  specs?: Record<string, string>
  careers?: string[]
  categoryId?: number
}

export interface CreateRequestInput {
  toolId: number
  qty: number
  startDate: string
  endDate: string
  notes?: string
}

export interface CreateLoanInput {
  requestId?: number
  toolId: number
  userId: number
  qty: number
  loanDate: string
  dueDate: string
}

export interface DashboardStats {
  totalTools: number
  available: number
  inUse: number
  maintenance: number
  pendingReqs: number
  activeLoans: number
  totalUsers: number
}

export interface TopTool {
  name: string
  count: number
}

export interface LoanByMonth {
  year: number
  month: number
  count: number
}

export interface Delays {
  totalOverdue: number
  totalActive: number
  rate: number
}

export interface ActiveUser {
  name: string
  loanCount: number
}
