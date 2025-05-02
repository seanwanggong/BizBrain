import { createBrowserRouter } from 'react-router-dom'
import Layout from '@/layouts/Layout'
import Home from '@/pages/Home'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import WorkflowList from '@/pages/workflows'
import WorkflowDesign from '@/pages/workflows/design'
import TaskList from '@/pages/tasks'
import ExecutionList from '@/pages/executions'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/workflows',
        element: <WorkflowList />,
      },
      {
        path: '/workflows/design',
        element: <WorkflowDesign />,
      },
      {
        path: '/tasks',
        element: <TaskList />,
      },
      {
        path: '/executions',
        element: <ExecutionList />,
      },
    ],
  },
  {
    path: '/auth/login',
    element: <Login />,
  },
  {
    path: '/auth/register',
    element: <Register />,
  },
])

export default router 