import './App.css'

import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

import Main from "./views/Main.tsx";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Main />
    </QueryClientProvider>
  );
}

export default App;
