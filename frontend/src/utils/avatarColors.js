// Predefined color combinations for avatars
const avatarColors = [
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-pink-500',
  'from-green-500 to-emerald-500',
  'from-orange-500 to-red-500',
  'from-indigo-500 to-blue-500',
  'from-pink-500 to-rose-500',
  'from-teal-500 to-cyan-500',
  'from-yellow-500 to-orange-500',
  'from-violet-500 to-purple-500',
  'from-emerald-500 to-teal-500',
  'from-rose-500 to-pink-500',
  'from-cyan-500 to-blue-500',
  'from-orange-500 to-yellow-500',
  'from-purple-500 to-indigo-500',
  'from-green-500 to-lime-500',
  'from-red-500 to-orange-500',
  'from-blue-500 to-indigo-500',
  'from-pink-500 to-purple-500',
  'from-teal-500 to-green-500',
  'from-yellow-500 to-green-500',
]

// Generate a consistent color based on user ID or name
export const getAvatarColor = (userId, userName = '') => {
  // Use user ID if available, otherwise use name
  const seed = userId || userName
  
  if (!seed) {
    // Fallback to a default color
    return 'from-telegram-500 to-primary-500'
  }
  
  // Convert seed to a number for consistent color selection
  let hash = 0
  if (typeof seed === 'string') {
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
  } else {
    hash = seed
  }
  
  // Use absolute value and modulo to get index
  const index = Math.abs(hash) % avatarColors.length
  return avatarColors[index]
}

// Alternative function that takes just a string (name or ID)
export const getAvatarColorFromString = (str) => {
  if (!str) return 'from-telegram-500 to-primary-500'
  
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  
  const index = Math.abs(hash) % avatarColors.length
  return avatarColors[index]
}
