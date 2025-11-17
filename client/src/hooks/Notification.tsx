import Notification from '@/components/ui/Notification/Notification';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';

type NotificationData = {
  message: string;
  isError?: boolean;
};

const NotificationContext = createContext<
  (msg: string, isError?: boolean) => void
>(() => {});

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notif, setNotif] = useState<NotificationData | null>(null);

  const notify = useCallback((message: string, isError = false) => {
    setNotif({ message, isError });

    setTimeout(() => {
      setNotif(null);
    }, 2000);
  }, []);

  return (
    <NotificationContext.Provider value={notify}>
      {children}
      {notif && <Notification not={notif.message} isError={notif.isError} />}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
