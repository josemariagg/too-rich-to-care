import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SelectBillionaire from './pages/SelectBillionaire';
import SpendMoney from './pages/SpendMoney';
import Summary from './pages/Summary';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentError from './pages/PaymentError';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SelectBillionaire />} />
        <Route path="/spend" element={<SpendMoney />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-error" element={<PaymentError />} />
        <Route path="/summary" element={<Summary />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;