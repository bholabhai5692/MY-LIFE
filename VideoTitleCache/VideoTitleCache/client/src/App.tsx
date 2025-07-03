import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/useAnalytics";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Home } from "@/pages/Home";
import { AdminPanel } from "@/pages/AdminPanel";
import { UserProfile } from "@/pages/UserProfile";
import NotFound from "@/pages/not-found";

function Router() {
  // Track page views when routes change
  useAnalytics();
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/admin" component={AdminPanel} />
          <Route path="/profile" component={UserProfile} />
          <Route path="/submit" component={() => <div className="container mx-auto px-4 py-8">Submit Story Page - Coming Soon</div>} />
          <Route path="/saved" component={() => <div className="container mx-auto px-4 py-8">Saved Articles Page - Coming Soon</div>} />
          <Route path="/category/:category" component={() => <div className="container mx-auto px-4 py-8">Category Page - Coming Soon</div>} />
          <Route path="/post/:slug" component={() => <div className="container mx-auto px-4 py-8">Post Detail Page - Coming Soon</div>} />
          <Route path="/search" component={() => <div className="container mx-auto px-4 py-8">Search Results Page - Coming Soon</div>} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  // Initialize Google Analytics when app loads
  useEffect(() => {
    // Verify required environment variable is present
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) {
      console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    } else {
      initGA();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
