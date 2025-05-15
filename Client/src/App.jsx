import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "../tailwind.css";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <nav>
          <Navbar />
        </nav>
        <main className="flex-grow text-white dark:text-black bg-customDark1-500 dark:bg-gray-200">
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </main>
        <footer>
          <Footer />
        </footer>
      </div>
    </Router>
  );
}

export default App;
