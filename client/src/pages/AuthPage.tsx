import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart } from "lucide-react";

export default function AuthPage() {
  return (
    <div className="flex min-h-screen">
      {/* Visual Brand Panel - Hidden on small mobile */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center">
         <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-secondary/40 backdrop-blur-3xl" />
         
         {/* Decorative elements */}
         <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl mix-blend-multiply animate-pulse" />
         <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/20 rounded-full blur-3xl mix-blend-multiply animate-pulse delay-1000" />
         
         <div className="relative z-10 text-center space-y-6 max-w-md px-8 text-foreground">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-white/40 dark:bg-black/20 backdrop-blur-xl rounded-3xl flex items-center justify-center shadow-xl border border-white/20">
                <Heart className="w-10 h-10 text-primary" fill="currentColor" />
              </div>
            </div>
            <h1 className="text-6xl font-display font-bold text-foreground drop-shadow-sm">Yes-Pillow</h1>
            <p className="text-xl text-foreground/80 leading-relaxed">
              A calm, private space to share your status and plans seamlessly with your partner. No endless texts, just pure connection.
            </p>
         </div>
      </div>
      
      {/* Auth Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-background/50 backdrop-blur-md p-6 sm:p-12 relative z-10">
        <Card className="w-full max-w-md p-8 sm:p-10 shadow-2xl border-white/20 bg-white/60 dark:bg-black/40 backdrop-blur-xl rounded-[2.5rem]">
          <div className="text-center mb-10">
            <div className="lg:hidden flex justify-center mb-6">
              <div className="w-16 h-16 bg-white/40 dark:bg-black/20 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-md border border-white/20">
                <Heart className="w-8 h-8 text-primary" fill="currentColor" />
              </div>
            </div>
            <h2 className="text-3xl font-display font-bold mb-3">Welcome in</h2>
            <p className="text-muted-foreground text-lg">Sign in to connect securely with your partner.</p>
          </div>
          
          <Button 
            asChild 
            className="w-full h-14 text-lg rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground hover-elevate shadow-lg shadow-primary/20"
          >
             <a href="/api/login">Continue with Replit</a>
          </Button>
          
          <p className="text-center text-sm text-muted-foreground mt-8">
            Completely private. One-to-one connection.
          </p>
        </Card>
      </div>
    </div>
  );
}
