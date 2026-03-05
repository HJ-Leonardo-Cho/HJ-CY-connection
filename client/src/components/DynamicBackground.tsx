import { useEffect, useState } from 'react';
import { Sun, Moon, CloudSun, Sunset } from 'lucide-react';

export function DynamicBackground() {
  const [timeObj, setTimeObj] = useState({ type: 'day', icon: Sun, classes: '' });

  useEffect(() => {
    const updateTime = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 8) {
        setTimeObj({ type: 'dawn', icon: CloudSun, classes: 'bg-gradient-to-br from-orange-100 to-rose-100 dark:from-orange-950 dark:to-rose-950' });
      } else if (hour >= 8 && hour < 17) {
        setTimeObj({ type: 'day', icon: Sun, classes: 'bg-gradient-to-br from-blue-50 to-amber-50 dark:from-sky-950 dark:to-indigo-950' });
      } else if (hour >= 17 && hour < 20) {
        setTimeObj({ type: 'dusk', icon: Sunset, classes: 'bg-gradient-to-br from-purple-100 to-orange-100 dark:from-purple-950 dark:to-orange-950' });
      } else {
        setTimeObj({ type: 'night', icon: Moon, classes: 'bg-gradient-to-br from-slate-900 to-indigo-950 dark:from-slate-950 dark:to-indigo-950' });
      }
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000 * 5); // Check every 5 mins
    return () => clearInterval(interval);
  }, []);

  const Icon = timeObj.icon;

  return (
    <div className={`fixed inset-0 -z-10 transition-colors duration-1000 ${timeObj.classes}`}>
      <div className="absolute top-8 right-8 opacity-[0.03] dark:opacity-[0.02] mix-blend-overlay pointer-events-none">
        <Icon className="w-[40vh] h-[40vh] md:w-[60vh] md:h-[60vh]" />
      </div>
      <div className="absolute inset-0 bg-background/40 backdrop-blur-[100px]" />
    </div>
  );
}
