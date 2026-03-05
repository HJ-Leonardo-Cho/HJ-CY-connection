import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function PairingPage() {
  const { user } = useAuth();
  const [inputCode, setInputCode] = useState("");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
      <div className="mb-6 text-center">
        <Heart className="w-12 h-12 text-pink-500 mx-auto mb-2" fill="currentColor" />
        <h1 className="text-2xl font-bold">반가워요, {user?.firstName || '형준'}님!</h1>
      </div>

      <Card className="w-full max-w-md p-6 bg-white shadow-xl rounded-3xl">
        <Tabs defaultValue="create">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="create">코드 생성</TabsTrigger>
            <TabsTrigger value="join">코드 입력</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="text-center space-y-4">
            <p className="text-gray-500">파트너에게 줄 코드를 만듭니다.</p>
            <Button className="w-full h-12" onClick={() => window.location.reload()}>
              새 코드 만들기 (클릭 시 갱신)
            </Button>
          </TabsContent>

          <TabsContent value="join" className="space-y-4">
            <Input 
              placeholder="코드를 입력하세요" 
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              className="text-center text-xl h-12"
            />
            <Button className="w-full h-12 bg-pink-500 hover:bg-pink-600">
              연결하기
            </Button>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}