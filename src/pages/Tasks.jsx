import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import Button from '../components/ui/Button';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', priority: '', assignee: '' });
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [members, setMembers] = useState([]);
  const { user } = useAuth();
  const [newTask, setNewTask] = useState({
    title: '', description: '', status: 'Todo', priority: 'Medium', assignee: ''
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter.status) params.status = filter.status;
      if (filter.priority) params.priority = filter.priority;
      const { data } = await api.get('/tasks', { params });
      setTasks(data);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const { data } = await api.get('/organizations/members');
      setMembers(data.members);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchMembers();
  }, [filter]); // Re-fetch when filters change

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${id}`);
        setTasks(tasks.filter(t => t._id !== id));
        toast.success('Task deleted');
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        const { data } = await api.put(`/tasks/${editingTask._id}`, newTask);
        setTasks(tasks.map(t => t._id === editingTask._id ? data : t));
        toast.success('Task updated');
      } else {
        const { data } = await api.post('/tasks', newTask);
        setTasks([data, ...tasks]);
        toast.success('Task created');
      }
      setShowModal(false);
      setEditingTask(null);
      setNewTask({ title: '', description: '', status: 'Todo', priority: 'Medium', assignee: '' });
    } catch (error) {
      toast.error('Failed to save task');
    }
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignee: task.assignee?._id || ''
    });
    setShowModal(true);
  };

  const statusColors = {
    'Todo': 'bg-gray-100 text-gray-700',
    'In Progress': 'bg-blue-100 text-blue-700',
    'Done': 'bg-green-100 text-green-700'
  };

  const priorityColors = {
    'Low': 'text-green-600',
    'Medium': 'text-orange-600',
    'High': 'text-red-600 font-bold'
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <Button icon={FiIcons.FiPlus} onClick={() => { setEditingTask(null); setShowModal(true); }}>
          New Task
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex gap-4 border border-gray-200">
        <select 
          className="border-gray-300 rounded-md text-sm"
          value={filter.status}
          onChange={(e) => setFilter({...filter, status: e.target.value})}
        >
          <option value="">All Statuses</option>
          <option value="Todo">Todo</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
        <select 
          className="border-gray-300 rounded-md text-sm"
          value={filter.priority}
          onChange={(e) => setFilter({...filter, priority: e.target.value})}
        >
          <option value="">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <Button variant="ghost" size="sm" onClick={() => setFilter({ status: '', priority: '', assignee: '' })}>
          Clear Filters
        </Button>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="text-center py-10">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No tasks found. Create one!</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tasks.map(task => (
            <div key={task._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-gray-900">{task.title}</h3>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", statusColors[task.status])}>
                    {task.status}
                  </span>
                  <span className={cn("text-xs font-medium flex items-center gap-1", priorityColors[task.priority])}>
                    {task.priority === 'High' && <SafeIcon icon={FiIcons.FiAlertCircle} className="w-3 h-3" />}
                    {task.priority}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{task.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <SafeIcon icon={FiIcons.FiUser} className="w-3 h-3" />
                    {task.assignee ? task.assignee.name : 'Unassigned'}
                  </span>
                  <span>Created by {task.createdBy?.name}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(task)} className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50">
                  <SafeIcon icon={FiIcons.FiEdit2} className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(task._id)} className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50">
                  <SafeIcon icon={FiIcons.FiTrash2} className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold mb-4">{editingTask ? 'Edit Task' : 'Create Task'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  required
                  className="w-full px-3 py-2 border rounded-md"
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md"
                  rows="3"
                  value={newTask.description}
                  onChange={e => setNewTask({...newTask, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={newTask.status}
                    onChange={e => setNewTask({...newTask, status: e.target.value})}
                  >
                    <option>Todo</option>
                    <option>In Progress</option>
                    <option>Done</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={newTask.priority}
                    onChange={e => setNewTask({...newTask, priority: e.target.value})}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={newTask.assignee}
                  onChange={e => setNewTask({...newTask, assignee: e.target.value})}
                >
                  <option value="">Unassigned</option>
                  {members.map(m => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit">Save Task</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;