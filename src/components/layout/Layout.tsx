import { Outlet } from "react-router-dom";
import Navigation from "./Navigation";
import Footer from "./Footer";
import LoadingSpinner from "../ui/LoadingSpinner";
import Chatbot from "../ui/Chatbot";
import { useLoading } from "../../hooks/useLoading";

const Layout = () => {
  const { isLoading } = useLoading();

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow pt-20">
        <Outlet />
      </main>
      <Footer />
      {isLoading && <LoadingSpinner />}
      {/* <Chatbot /> */}
    </div>
  );
};

export default Layout;
