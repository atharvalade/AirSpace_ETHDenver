import { DM_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import { ThemeProvider } from "next-themes";
import ScrollToTop from "@/components/ScrollToTop";
import Aoscompo from "@/utils/aos";
import { ZkSyncAuthProvider } from "@/context/ZkSyncAuthContext";
import { HumanityProtocolProvider } from "@/context/HumanityProtocolContext";
import { FlowProvider } from "@/context/FlowContext";
import { Toaster } from "react-hot-toast";
import AutoCredentialCreator from "@/components/Auth/AutoCredentialCreator";
import { HUMANITY_PROTOCOL_API_KEY } from "@/config/humanityProtocol";

const font = DM_Sans({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${font.className}`}>
        <ThemeProvider
          attribute="class"
          enableSystem={true}
          defaultTheme="system"
        >
          <ZkSyncAuthProvider>
            <HumanityProtocolProvider apiKey={HUMANITY_PROTOCOL_API_KEY}>
              <FlowProvider>
                <Aoscompo>
                  <Header />
                  {children}
                  <Footer />
                  {/* This component will handle automatic credential creation */}
                  <AutoCredentialCreator />
                </Aoscompo>
                <ScrollToTop />
                <Toaster position="top-right" />
              </FlowProvider>
            </HumanityProtocolProvider>
          </ZkSyncAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
