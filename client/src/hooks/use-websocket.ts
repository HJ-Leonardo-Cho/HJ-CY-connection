import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { api } from '@shared/routes';

export function useAppWebSocket(isAuthenticated: boolean, isPaired: boolean) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    function connect() {
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('[WS] Connected');
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'status-update') {
            // Invalidate partner status so UI refreshes
            queryClient.invalidateQueries({ queryKey: [api.status.getPartner.path] });

            // Trigger alert if it contains (Alert)
            const notice = data.payload?.futureNotice;
            if (notice && notice.includes('(Alert)')) {
              // App toast
              toast({
                title: "❤️ Partner Alert",
                description: notice,
                variant: "default",
                className: "bg-accent text-accent-foreground border-accent-foreground/20",
              });
              
              // Browser Push Notification
              if ("Notification" in window && Notification.permission === 'granted') {
                new Notification("Yes-Pillow: Partner Alert", { 
                  body: notice,
                  icon: '/favicon.png'
                });
              }
            }
          } 
          
          else if (data.type === 'paired') {
            queryClient.invalidateQueries({ queryKey: [api.pairing.status.path] });
            toast({
              title: "Connection Successful! 🎉",
              description: "You have been paired with your partner.",
            });
          }
        } catch (err) {
          console.error('[WS] Error parsing message', err);
        }
      };

      ws.current.onclose = () => {
        // Reconnect with backoff
        setTimeout(connect, 3000);
      };
    }

    connect();

    return () => {
      if (ws.current) {
        ws.current.onclose = null;
        ws.current.close();
      }
    };
  }, [isAuthenticated, isPaired, queryClient, toast]);
}
