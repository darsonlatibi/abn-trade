import type { ReactNode } from "react";
import { Provider } from "react-redux";

import { store } from "../stores/store";
import AuthInitializer from "../components/auth/AuthInitializer";
interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <Provider store={store}>
      <AuthInitializer />

      {children}
    </Provider>
  );
}
