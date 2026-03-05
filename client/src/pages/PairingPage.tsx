import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useGeneratePairingCode, useUsePairingCode, usePairingCode } from "@/hooks/use-pairing";

export default function PairingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [code, setCode] = useState("");
  
  const { data: codeData } = usePairingCode();
  const generateCodeMutation = useGeneratePairingCode();
  const useCodeMutation = useUsePairingCode();

  const handleCopy = () => {
    if (codeData?.code) {
      navigator.clipboard.writeText(codeData.code);
      toast({ title: "Code copied! ✨", description: "Send this to your partner." });
    }
  };

  const handleConnect = () => {
    useCodeMutation.mutate(code, {
      onError: (err) => {
        toast({
          title: "Couldn't connect",
          description: err.message,
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 relative z-10 pt-safe">
      <div className="mb-8 text-center space-y-2">
        <div className="w-16 h-16 bg-card/60 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-lg border border-white/20 mx-auto mb-4">
          <Users className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-display font-bold">Hello, {user?.firstName}!</h1>
        <p className="text-muted-foreground text-lg">Let's connect you with your partner.</p>
      </div>

      <Card className="max-w-md w-full p-6 sm:p-8 rounded-[2.5rem] shadow-2xl bg-card/40 backdrop-blur-2xl border border-white/20 dark:border-white/5">
         <Tabs defaultValue="join">
           <TabsList className="w-full mb-8 h-14 bg-background/50 backdrop-blur-md rounded-2xl p-1">
             <TabsTrigger value="join" className="w-1/2 rounded-xl text-base h-full data-[state=active]:shadow-md">Have a code?</TabsTrigger>
             <TabsTrigger value="create" className="w-1/2 rounded-xl text-base h-full data-[state=active]:shadow-md">Create code</TabsTrigger>
           </TabsList>

           <TabsContent value="join" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
             <div className="space-y-4">
               <Label className="text-base text-center block">Enter Partner's Invite Code</Label>
               <Input
                 value={code}
                 onChange={e => setCode(e.target.value.toUpperCase())}
                 placeholder="e.g. A1B2C3"
                 className="h-16 text-center text-3xl font-mono tracking-[0.5em] uppercase rounded-2xl bg-background/80 border-0 shadow-inner"
                 maxLength={6}
               />
               <Button
                 className="w-full h-14 rounded-2xl text-lg hover-elevate shadow-lg shadow-primary/20"
                 onClick={handleConnect}
                 disabled={useCodeMutation.isPending || code.length < 4}
               >
                 {useCodeMutation.isPending ? 'Connecting...' : 'Connect'}
               </Button>
             </div>
           </TabsContent>

           <TabsContent value="create" className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
              <p className="text-muted-foreground">Generate a unique code to share with your partner. They will enter it on their device.</p>
              
              {codeData?.code ? (
                <div className="p-8 bg-primary/5 rounded-[2rem] border border-primary/20 shadow-inner">
                  <p className="text-5xl font-mono font-bold tracking-[0.2em] text-primary mb-6 drop-shadow-sm">{codeData.code}</p>
                  <Button variant="outline" className="h-12 rounded-xl hover-elevate bg-background/50 border-primary/20 text-primary hover:text-primary hover:bg-primary/10" onClick={handleCopy}>
                    <Copy className="w-4 h-4 mr-2"/> Copy Code
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full h-14 rounded-2xl text-lg hover-elevate shadow-lg shadow-primary/20"
                  onClick={() => generateCodeMutation.mutate()}
                  disabled={generateCodeMutation.isPending}
                >
                  {generateCodeMutation.isPending ? 'Generating...' : 'Generate Code'}
                </Button>
              )}
           </TabsContent>
         </Tabs>
      </Card>
      
      <div className="mt-8 text-center">
        <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={() => window.location.href = "/api/logout"}>
          Sign out
        </Button>
      </div>
    </div>
  );
}
