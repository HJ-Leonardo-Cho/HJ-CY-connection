import { cn } from "@/lib/utils";
import { Bell } from "lucide-react";

interface SelectionButtonProps {
  icon: string;
  label: string;
  isActive: boolean;
  isAlert?: boolean;
  isPending?: boolean;
  onClick: () => void;
}

export function SelectionButton({ icon, label, isActive, isAlert, isPending, onClick }: SelectionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isPending}
      className={cn(
        "relative p-4 rounded-[1.25rem] flex flex-col items-center justify-center text-center transition-all duration-300 ease-out border-2 overflow-hidden group",
        isActive
          ? "bg-primary border-primary text-primary-foreground shadow-xl shadow-primary/20 scale-[1.02] z-10"
          : "bg-card/40 border-transparent hover:bg-card/80 hover:scale-[1.02] shadow-sm backdrop-blur-md text-foreground",
        isPending && "opacity-50 cursor-not-allowed scale-100"
      )}
    >
      <span className="text-3xl mb-2 drop-shadow-sm group-hover:-translate-y-1 transition-transform duration-300">{icon}</span>
      <span className="text-sm font-medium leading-tight">{label}</span>
      
      {isAlert && (
         <div className={cn(
           "absolute top-2 right-2 flex items-center justify-center w-6 h-6 rounded-full",
           isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-destructive/10 text-destructive"
         )}>
           <Bell className="w-3 h-3" />
         </div>
      )}
    </button>
  );
}
