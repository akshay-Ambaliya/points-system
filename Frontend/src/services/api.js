import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

export const getBackendHealth = async () => {
  try {
    const { data } = await api.get('/')
    return data
  } catch (error) {
    console.error('Failed to fetch backend health:', error)
    return null
  }
}

// Registration APIs
export const fetchRegisteredYuvaks = async (search = '', page = 0, size = 10) => {
  try {
    const { data } = await api.get('/registration', { params: { search, page, size } })
    return data.data
  } catch (error) {
    console.error('Failed to fetch yuvaks:', error)
    return { content: [], totalElements: 0, totalPages: 0 }
  }
}

export const fetchAllYuvakNames = async () => {
  try {
    const { data } = await api.get('/registration/all')
    return data.data || []
  } catch (error) {
    console.error('Failed to fetch all yuvak names:', error)
    return []
  }
}

export const registerYuvak = async (yuvakData) => {
  const { data } = await api.post('/registration', yuvakData)
  return data.data
}

export const updateYuvak = async (id, yuvakData) => {
  const { data } = await api.put(`/registration/${id}`, yuvakData)
  return data.data
}

export const deleteYuvak = async (id) => {
  const { data } = await api.delete(`/registration/${id}`)
  return data.data
}

export const reactivateYuvak = async (id) => {
  const { data } = await api.put(`/registration/${id}/reactivate`)
  return data.data
}

export const fetchInactiveYuvaks = async (search = '', page = 0, size = 10) => {
  try {
    const { data } = await api.get('/registration/inactive', { params: { search, page, size } })
    return data.data
  } catch (error) {
    console.error('Failed to fetch inactive yuvaks:', error)
    return { content: [], totalElements: 0, totalPages: 0 }
  }
}

// Teams APIs
export const fetchTeams = async () => {
  try {
    const { data } = await api.get('/teams')
    return data.data || []
  } catch (error) {
    console.error('Failed to fetch teams:', error)
    return []
  }
}

export const saveTeam = async (teamData) => {
  const { data } = await api.post('/teams', teamData)
  return data.data
}

export const updateTeam = async (id, teamData) => {
  const { data } = await api.put(`/teams/${id}`, teamData)
  return data.data
}

// Attendance APIs
export const fetchAttendanceStatus = async (dateStr) => {
  try {
    const { data } = await api.get('/attendance/yuvaks', { params: { date: dateStr } })
    return data.data || []
  } catch (error) {
    console.error('Failed to fetch attendance status:', error)
    return []
  }
}

export const updateAttendanceLog = async (logData) => {
  const { data } = await api.put('/attendance', logData)
  return data.data
}

// Points APIs
export const fetchPointsLogs = async (type = '', yuvakId = '', page = 0, size = 50) => {
  try {
    const { data } = await api.get('/points', { params: { type: type || null, yuvakId: yuvakId || null, page, size } })
    return data.data
  } catch (error) {
    console.error('Failed to fetch points logs:', error)
    return { content: [], totalElements: 0, totalPages: 0 }
  }
}

export const addPointsLog = async (pointsData) => {
  const { data } = await api.post('/points', pointsData)
  return data.data
}

export default api