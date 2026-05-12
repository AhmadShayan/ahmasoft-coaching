import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import Home from "@/pages/Home";

const BookPage = lazy(() => import("@/pages/Book"));

const queryClient = new QueryClient();

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      {children}
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Toaster richColors position="top-center" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PageShell><Home /></PageShell>} />
            <Route
              path="/book"
              element={
                <PageShell>
                  <Suspense fallback={<div className="min-h-screen bg-navy" />}>
                    <BookPage />
                  </Suspense>
                </PageShell>
              }
            />
            <Route path="*" element={<PageShell><Home /></PageShell>} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
