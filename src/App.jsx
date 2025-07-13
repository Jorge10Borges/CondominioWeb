import './App.css';
import Layout from './Layout';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes';

function App() {
  return (
    <Router>
      <Layout>
        <AppRoutes />
      </Layout>
    </Router>
  );
}

export default App;
