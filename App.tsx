import { NativeBaseProvider, StatusBar, theme } from "native-base";
import Rotas from "./src/components/Router";

export default function App() {
  return (
    <NativeBaseProvider theme={theme}>
      <StatusBar backgroundColor={"black"} />
      <Rotas />
    </NativeBaseProvider>
  );
}
