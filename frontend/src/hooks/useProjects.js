import { useState, useEffect, useCallback } from 'react'
import { projectService } from '../services/project.service'
import toast from 'react-hot-toast'

export const useProjects = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await projectService.getAll()
      setProjects(res.data.data.projects)
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load projects.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const createProject = async (data) => {
    const res = await projectService.create(data)
    const newProject = res.data.data.project
    setProjects((prev) => [newProject, ...prev])
    toast.success('Project created successfully.')
    return newProject
  }

  const updateProject = async (id, data) => {
    const res = await projectService.update(id, data)
    const updated = res.data.data.project
    setProjects((prev) => prev.map((p) => (p._id === id ? updated : p)))
    toast.success('Project updated.')
    return updated
  }

  const deleteProject = async (id) => {
    await projectService.delete(id)
    setProjects((prev) => prev.filter((p) => p._id !== id))
    toast.success('Project deleted.')
  }

  return { projects, loading, error, fetchProjects, createProject, updateProject, deleteProject }
}
