import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/layout/Layout';

export default function App() {
  return (
    <ThemeProvider>
      <Layout />
    </ThemeProvider>
  );
}
