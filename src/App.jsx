import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/authService';
import PrivateRoute from './components/PrivateRoute';
import Layout from './layouts/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Purchases from './pages/Purchases';
import Sales from './pages/Sales';
import ProfitReport from './pages/ProfitReport';
import Profile from './pages/Profile';

function App() {
    return (
        <Router>
            <Routes>
                <Route
                    path="/login"
                    element={
                        authService.isAuthenticated() ? <Navigate to="/" /> : <Login />
                    }
                />

                <Route
                    path="/"
                    element={
                        <PrivateRoute>
                            <Layout>
                                <Dashboard />
                            </Layout>
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/products"
                    element={
                        <PrivateRoute>
                            <Layout>
                                <Products />
                            </Layout>
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/purchases"
                    element={
                        <PrivateRoute>
                            <Layout>
                                <Purchases />
                            </Layout>
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/sales"
                    element={
                        <PrivateRoute>
                            <Layout>
                                <Sales />
                            </Layout>
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/profit"
                    element={
                        <PrivateRoute>
                            <Layout>
                                <ProfitReport />
                            </Layout>
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/profile"
                    element={
                        <PrivateRoute>
                            <Layout>
                                <Profile />
                            </Layout>
                        </PrivateRoute>
                    }
                />

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;
