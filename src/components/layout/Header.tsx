"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signIn, signOut } from "next-auth/react"
import { useTheme } from "../providers/ThemeProvider"
import { Sun, Moon, LineChart } from "lucide-react"
import { NotificationBell } from "./NotificationBell"
import styles from "./Header.module.css"

export function Header() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()

  return (
    <header className={styles.header}>
      <div className={`container ${styles.nav}`}>
        <Link href="/" className={styles.logo}>
          <LineChart size={24} />
          DSE Tracker
        </Link>

        <div className={styles.links}>
          <Link href="/" className={`${styles.link} ${pathname === "/" ? styles.activeLink : ""}`}>
            Dashboard
          </Link>
          <Link href="/add" className={`${styles.link} ${pathname === "/add" ? styles.activeLink : ""}`}>
            Add Share
          </Link>
          {session && (
            <Link href="/accounts" className={`${styles.link} ${pathname === "/accounts" ? styles.activeLink : ""}`}>
              Account
            </Link>
          )}
        </div>

        <div className={styles.actions}>
          <button onClick={toggleTheme} className={styles.iconBtn} aria-label="Toggle theme">
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {session ? (
            <>
              <NotificationBell />
              {session.user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt="Profile"
                  className={styles.avatar}
                  onClick={() => signOut()}
                  title="Sign out"
                />
              ) : (
                <button className={styles.loginBtn} onClick={() => signOut()}>
                  Sign out
                </button>
              )}
            </>
          ) : (
            <button className={styles.loginBtn} onClick={() => signIn("google")}>
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
