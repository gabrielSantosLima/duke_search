import { router } from "./Router";
import { RouterProvider } from "react-router/dom";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";

export function App() {
  return (
    <ChakraProvider value={defaultSystem}>
      <RouterProvider router={router} />;
    </ChakraProvider>
  );
}
