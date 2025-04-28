import { createBrowserRouter } from 'react-router-dom'
import Layout from '@/layouts/Layout'
import Home from '@/pages/Home'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import KnowledgeBase from '@/pages/knowledge'
import WorkflowList from '@/pages/workflows'
import WorkflowDesign from '@/pages/workflows/design'

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
        path: '/knowledge',
        element: <KnowledgeBase />,
      },
      {
        path: '/workflows',
        element: <WorkflowList />,
      },
      {
        path: '/workflows/design',
        element: <WorkflowDesign />,
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