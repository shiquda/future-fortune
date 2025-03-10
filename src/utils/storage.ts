import { InvestOption } from '@/types/invest'
import { UserInfo } from '@/types/user'

const STORAGE_KEY = 'future_fortune_invest_options'
const USER_INFO_KEY = 'future_fortune_user_info'

export const saveInvestOptionsToStorage = (options: InvestOption[]): void => {
  try {
    const serializedOptions = JSON.stringify(options)
    localStorage.setItem(STORAGE_KEY, serializedOptions)
  } catch (error) {
    console.error('保存投资选项到本地存储失败:', error)
  }
}

export const loadInvestOptionsFromStorage = (): InvestOption[] | null => {
  try {
    const serializedOptions = localStorage.getItem(STORAGE_KEY)
    if (serializedOptions === null) {
      return null
    }
    return JSON.parse(serializedOptions)
  } catch (error) {
    console.error('从本地存储加载投资选项失败:', error)
    return null
  }
}

export const clearInvestOptionsFromStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('清除本地存储中的投资选项失败:', error)
  }
}

export const saveUserInfoToStorage = (userInfo: UserInfo): void => {
  try {
    const serializedUserInfo = JSON.stringify(userInfo)
    localStorage.setItem(USER_INFO_KEY, serializedUserInfo)
  } catch (error) {
    console.error('保存用户信息到本地存储失败:', error)
  }
}

export const loadUserInfoFromStorage = (): UserInfo | null => {
  try {
    const serializedUserInfo = localStorage.getItem(USER_INFO_KEY)
    if (serializedUserInfo === null) {
      return null
    }
    return JSON.parse(serializedUserInfo)
  } catch (error) {
    console.error('从本地存储加载用户信息失败:', error)
    return null
  }
}
