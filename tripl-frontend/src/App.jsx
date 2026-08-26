import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from "./components/layout/Navbar"
import Footer from "./components/layout/Footer"
import MobileNav from "./components/layout/MobileNav"
import ToastContainer from "./components/ui/Toast"
import Landing from "./pages/Landing"
import Explore from "./pages/Explore"
import PlaceDetail from "./pages/PlaceDetail"
import Planner from "./pages/Planner"
import Itinerary from "./pages/Itinerary"
import Saved from "./pages/Saved"
import Profile from "./pages/Profile"
import Auth from "./pages/Auth"
import ResponsibleTravel from "./pages/ResponsibleTravel"

function Layout({ children, noFooter = false }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      {!noFooter && <Footer />}
      <MobileNav />
      <ToastContainer />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><Landing /></Layout>} />
        <Route path="/explore" element={<Layout noFooter><Explore /></Layout>} />
        <Route path="/place/:id" element={<Layout><PlaceDetail /></Layout>} />
        <Route path="/plan" element={<Layout><Planner /></Layout>} />
        <Route path="/itinerary" element={<Layout><Itinerary /></Layout>} />
        <Route path="/saved" element={<Layout><Saved /></Layout>} />
        <Route path="/profile" element={<Layout><Profile /></Layout>} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/responsible" element={<Layout><ResponsibleTravel /></Layout>} />
        <Route path="*" element={<Layout><div className="flex flex-col items-center justify-center min-h-[60vh] gap-4"><p className="text-6xl">🗺️</p><h2 className="font-display font-bold text-3xl text-indigo">Page Not Found</h2><a href="/" className="btn-primary">Go Home</a></div></Layout>} />
      </Routes>
    </BrowserRouter>
  )
}
