import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProductForm from './components/ProductForm';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';

function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<LoginForm/>} />
      <Route path="/signup" element={<SignupForm/>} />
      <Route path="/product-form" element={<ProductForm/>} />
    </Routes>
  </BrowserRouter>
  );
}

export default App;
