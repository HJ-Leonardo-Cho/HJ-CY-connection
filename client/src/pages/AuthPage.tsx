import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });

      if (res.ok) {
        // 로그인 성공 시 메인 화면으로 새로고침 이동
        window.location.href = "/";
      } else {
        const data = await res.json();
        toast({ title: "로그인 실패", description: data.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "오류 발생", description: "서버와 연결할 수 없습니다.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* 왼쪽 배경 화면 (PC에서만 보임) */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center">
         <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-secondary/40 backdrop-blur-3xl" />
         
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
      
      {/* 오른쪽 로그인 폼 */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-background/50 backdrop-blur-md p-6 sm:p-12 relative z-10">
        <Card className="w-full max-w-md p-8 sm:p-10 shadow-2xl border-white/20 bg-white/60 dark:bg-black/40 backdrop-blur-xl rounded-[2.5rem]">
          <div className="text-center mb-10">
            <div className="lg:hidden flex justify-center mb-6">
              <div className="w-16 h-16 bg-white/40 dark:bg-black/20 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-md border border-white/20">
                <Heart className="w-8 h-8 text-primary" fill="currentColor" />
              </div>
            </div>
            <h2 className="text-3xl font-display font-bold mb-3">Welcome in</h2>
            <p className="text-muted-foreground text-lg">이름과 비밀번호를 입력해주세요.</p>
          </div>
          
          {/* 입력 폼 시작 */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                placeholder="이름 (예: 형준)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-14 rounded-2xl text-lg bg-background/80"
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 rounded-2xl text-lg bg-background/80"
                required
              />
            </div>
            <Button 
              type="submit"
              disabled={isLoading}
              className="w-full h-14 text-lg rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground hover-elevate shadow-lg shadow-primary/20 mt-4"
            >
              {isLoading ? "연결 중..." : "Connect"}
            </Button>
          </form>
          {/* 입력 폼 끝 */}

          <p className="text-center text-sm text-muted-foreground mt-8">
            Completely private. One-to-one connection.
          </p>
        </Card>
      </div>
    </div>
  );
}