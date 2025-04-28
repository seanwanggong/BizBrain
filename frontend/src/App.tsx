import { ConfigProvider } from 'antd'
import { RouterProvider } from 'react-router-dom'
import router from './router.tsx'
import './index.css'

function App() {
  return (
    <ConfigProvider>
      <RouterProvider router={router} />
    </ConfigProvider>
  )
}

export default App 