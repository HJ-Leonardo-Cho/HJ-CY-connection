import { useAuth } from "@/hooks/use-auth";
import { useMyStatus, usePartnerStatus, useUpdateStatus } from "@/hooks/use-status";
import { useUnpair } from "@/hooks/use-pairing";
import { SelectionButton } from "@/components/SelectionButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { LogOut, Unlink, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CURRENT_STATUSES = [
  { id: 'eating', label: 'Eating', icon: '🍴' },
  { id: 'commuting', label: 'Commuting', icon: '🚌' },
  { id: 'studying', label: 'Studying', icon: '💻' },
  { id: 'resting', label: 'Resting', icon: '🧘' },
];

const FUTURE_SLEEP = [
  { id: 'sleep_30m', label: 'Sleep in 30m', icon: '💤' },
  { id: 'youtube_sleep', label: 'YouTube then Sleep', icon: '📱' },
  { id: 'sleep_early_tomorrow', label: 'Sleep early for tomorrow', icon: '🌅' },
  { id: 'gaming_all_night', label: 'Gaming all night', icon: '🎮' },
  { id: 'early_sleep', label: 'Early sleep (No plans)', icon: '🛏️' },
];

const FUTURE_CALL = [
  { id: 'no_calls', label: 'No calls today', icon: '🔇' },
  { id: 'alone_time', label: 'Need alone time', icon: '🧘‍♂️' },
  { id: 'want_voice', label: 'Want to hear your voice', icon: '📞', alert: true },
  { id: 'funny_story', label: 'Funny story to tell', icon: '😂', alert: true },
  { id: 'daily_report', label: 'Daily report', icon: '📝' },
  { id: 'make_up', label: "Let's make up", icon: '❤️', alert: true },
];

export default function DashboardPage({ partner }: { partner: any }) {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  const { data: myStatus } = useMyStatus();
  const { data: partnerStatus } = usePartnerStatus();
  const updateStatusMutation = useUpdateStatus();
  const unpairMutation = useUnpair();

  const handleUpdateCurrent = (label: string) => {
    // If tapping the already active button, clear it
    const newStatus = myStatus?.currentStatus === label ? null : label;
    updateStatusMutation.mutate({ currentStatus: newStatus, futureNotice: myStatus?.futureNotice });
  };

  const handleUpdateFuture = (label: string, isAlert: boolean = false) => {
    // If tapping the already active button, clear it
    const val = isAlert ? `${label} (Alert)` : label;
    const newNotice = myStatus?.futureNotice === val ? null : val;
    updateStatusMutation.mutate({ currentStatus: myStatus?.currentStatus, futureNotice: newNotice });
  };

  const handleUnpair = () => {
    if (confirm("Are you sure you want to disconnect from this partner?")) {
      unpairMutation.mutate(undefined, {
        onSuccess: () => toast({ title: "Disconnected" })
      });
    }
  };

  const renderIconForState = (statusText: string | null | undefined, arrays: any[]) => {
    if (!statusText) return null;
    const cleanText = statusText.replace(' (Alert)', '');
    for (const arr of arrays) {
      const found = arr.find((item: any) => item.label === cleanText);
      if (found) return found.icon;
    }
    return '✨';
  };

  return (
    <div className="min-h-screen pt-safe pb-24 px-4 sm:px-6 md:max-w-2xl md:mx-auto relative z-10">
      
      {/* Header */}
      <header className="flex items-center justify-between py-6">
        <h1 className="text-2xl font-display font-bold text-primary drop-shadow-sm">Yes-Pillow</h1>
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <Avatar className="cursor-pointer hover-elevate ring-2 ring-primary/20 shadow-md w-12 h-12">
              <AvatarImage src={user?.profileImageUrl} />
              <AvatarFallback className="bg-background text-foreground font-bold">
                {user?.firstName?.[0] || 'Me'}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 bg-background/80 backdrop-blur-xl border-white/20">
             <div className="px-2 py-3 text-sm text-muted-foreground border-b border-border/50 mb-2">
               Signed in as {user?.firstName}
             </div>
             <DropdownMenuItem onClick={handleUnpair} className="rounded-xl cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
               <Unlink className="w-4 h-4 mr-2" /> Disconnect Partner
             </DropdownMenuItem>
             <DropdownMenuItem onClick={() => logout()} className="rounded-xl cursor-pointer">
               <LogOut className="w-4 h-4 mr-2" /> Sign out
             </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <main className="space-y-12">
        
        {/* Partner Card */}
        <section className="animate-in fade-in slide-in-from-top-4 duration-700">
          <Card className="relative overflow-hidden border border-white/20 shadow-2xl bg-white/40 dark:bg-black/30 backdrop-blur-xl p-6 sm:p-8 rounded-[2.5rem]">
            {/* Decorative glows */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent/20 rounded-full blur-3xl" />

            <div className="relative z-10 flex flex-col items-center text-center">
              <Avatar className="w-24 h-24 mb-4 shadow-xl ring-4 ring-background/50">
                <AvatarImage src={partner?.profileImageUrl} />
                <AvatarFallback className="text-3xl bg-primary/10 text-primary font-display font-bold">
                  {partner?.firstName?.[0] || 'P'}
                </AvatarFallback>
              </Avatar>

              <h2 className="text-2xl font-display font-bold mb-8 text-foreground">{partner?.firstName || 'Partner'}'s Status</h2>

              <div className="flex flex-col gap-4 w-full max-w-sm">
                
                <div className="bg-background/60 dark:bg-background/40 backdrop-blur-md rounded-[1.5rem] p-4 flex items-center shadow-sm border border-white/10 transition-all hover:bg-background/80">
                  <div className="w-14 h-14 rounded-2xl bg-primary/15 text-primary flex items-center justify-center text-3xl mr-4 shrink-0 drop-shadow-sm">
                     {renderIconForState(partnerStatus?.currentStatus, [CURRENT_STATUSES]) || '💭'}
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-[0.7rem] text-muted-foreground font-bold uppercase tracking-widest mb-1">Current Status</p>
                    <p className="text-xl font-medium leading-tight text-foreground">
                      {partnerStatus?.currentStatus || 'Nothing right now'}
                    </p>
                  </div>
                </div>

                <div className="bg-background/60 dark:bg-background/40 backdrop-blur-md rounded-[1.5rem] p-4 flex items-center shadow-sm border border-white/10 transition-all hover:bg-background/80 relative">
                  {partnerStatus?.futureNotice?.includes('(Alert)') && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full animate-ping" />
                  )}
                  <div className="w-14 h-14 rounded-2xl bg-accent/15 text-accent flex items-center justify-center text-3xl mr-4 shrink-0 drop-shadow-sm">
                     {renderIconForState(partnerStatus?.futureNotice, [FUTURE_SLEEP, FUTURE_CALL]) || '⏳'}
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-[0.7rem] text-muted-foreground font-bold uppercase tracking-widest mb-1">Future Notice</p>
                    <p className="text-xl font-medium leading-tight text-foreground">
                      {partnerStatus?.futureNotice ? partnerStatus.futureNotice.replace(' (Alert)', '') : 'No plans set'}
                    </p>
                  </div>
                </div>

              </div>

              <div className="mt-6 flex items-center justify-center text-xs text-muted-foreground/80 font-medium">
                <Info className="w-3 h-3 mr-1" />
                {partnerStatus?.updatedAt ? 
                  `Updated ${formatDistanceToNow(new Date(partnerStatus.updatedAt), { addSuffix: true })}` : 
                  'Awaiting first update'}
              </div>
            </div>
          </Card>
        </section>

        {/* My Current Status */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
          <h2 className="text-xl font-display font-semibold mb-4 flex items-center text-foreground/90">
             <span className="w-2 h-2 rounded-full bg-primary mr-2" /> My Current Status
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CURRENT_STATUSES.map(s => (
              <SelectionButton
                key={s.id}
                icon={s.icon}
                label={s.label}
                isActive={myStatus?.currentStatus === s.label}
                onClick={() => handleUpdateCurrent(s.label)}
                isPending={updateStatusMutation.isPending}
              />
            ))}
          </div>
        </section>

        {/* My Future Plans */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
          <h2 className="text-xl font-display font-semibold mb-6 flex items-center text-foreground/90">
             <span className="w-2 h-2 rounded-full bg-accent mr-2" /> My Future Notice
          </h2>
          
          <div className="space-y-8">
            <div className="bg-card/20 p-4 sm:p-6 rounded-[2rem] border border-white/10 shadow-sm backdrop-blur-md">
              <h4 className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-widest pl-2">Sleep Routine</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {FUTURE_SLEEP.map(s => (
                  <SelectionButton
                    key={s.id}
                    icon={s.icon}
                    label={s.label}
                    isActive={myStatus?.futureNotice === s.label}
                    onClick={() => handleUpdateFuture(s.label)}
                    isPending={updateStatusMutation.isPending}
                  />
                ))}
              </div>
            </div>

            <div className="bg-card/20 p-4 sm:p-6 rounded-[2rem] border border-white/10 shadow-sm backdrop-blur-md">
              <h4 className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-widest pl-2">Call & Connection</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {FUTURE_CALL.map(s => (
                  <SelectionButton
                    key={s.id}
                    icon={s.icon}
                    label={s.label}
                    isAlert={s.alert}
                    isActive={myStatus?.futureNotice === (s.alert ? `${s.label} (Alert)` : s.label)}
                    onClick={() => handleUpdateFuture(s.label, s.alert)}
                    isPending={updateStatusMutation.isPending}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
        
      </main>
    </div>
  );
}
