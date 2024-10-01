import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './pages/Auth';
import { ToastContainer } from 'react-toastify';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import DocumentEditor from './pages/DocumentEditor';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <>
    <ToastContainer />
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/documents" element={<Dashboard />} />
            <Route path="/documents/:docId" element={<DocumentEditor />} />
          </Route>
        </Route>
        <Route path="*" element={<Auth />} />
      </Routes>
    </Router>
    </>
  );
}

export default App;
