import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Navbar } from '@/components/Navbar'
import { Home } from '@/pages/Home'
import { Watch } from '@/pages/Watch'
import { Search } from '@/pages/Search'
import { Channel } from '@/pages/Channel'
import {PasswordGate} from '@/components/PasswordGate'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    }
  }
})

export default function App() {
  return (
    <PasswordGate>                              
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Navbar />
            <Routes>
              <Route path="/"            element={<Home />} />
              <Route path="/watch/:id"   element={<Watch />} />
              <Route path="/search"      element={<Search />} />
              <Route path="/channel/:id" element={<Channel />} />
            </Routes>
          </div>
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </PasswordGate>
  )
}