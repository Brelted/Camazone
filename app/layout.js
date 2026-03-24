import "./globals.css"
import Navbar from "@/components/Navbar"
import { ThemeProvider } from "@/lib/ThemeContext"

export const metadata = {
  title: "CAMAZONE 🌍",
  description: "L'Afrique dans votre panier",
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <ThemeProvider>
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}