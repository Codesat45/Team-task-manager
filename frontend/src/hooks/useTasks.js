import { useState, useEffect, useCallback } from 'react'
import { taskService } from '../services/task.service'
import toast from 'react-hot-toast'

export const useTasks = (initialParams = {}) => {
  const [tasks, setTasks] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [params, setParams] = useState(initialParams)

  const fetchTasks = useCallback(async (queryParams = params) => {
    setLoading(true)
    setError(null)
    try {
      // Remove empty params
      const cleanParams = Object.fromEntries(
        Object.entries(queryParams).filter(([, v]) => v !== '' && v != null)
      )
      const res = await taskService.getAll(cleanParams)
      setTasks(res.data.data.tasks)
      setPagination(res.data.data.pagination)
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load tasks.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() => {
    fetchTasks(params)
  }, [params]) // eslint-disable-line react-hooks/exhaustive-deps

  const updateParams = (newParams) => {
    setParams((prev) => ({ ...prev, ...newParams, page: 1 }))
  }

  const createTask = async (data) => {
    const res = await taskService.create(data)
    toast.success('Task created successfully.')
    fetchTasks(params)
    return res.data.data.task
  }

  const updateTask = async (id, data) => {
    const res = await taskService.update(id, data)
    const updated = res.data.data.task
    setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)))
    toast.success('Task updated.')
    return updated
  }

  const deleteTask = async (id) => {
    await taskService.delete(id)
    setTasks((prev) => prev.filter((t) => t._id !== id))
    toast.success('Task deleted.')
  }

  return {
    tasks,
    pagination,
    loading,
    error,
    params,
    updateParams,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  }
}
