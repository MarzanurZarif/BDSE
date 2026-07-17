"use client"

import { useState, useEffect, useRef } from "react"
import { Bell } from "lucide-react"
import styles from "./NotificationBell.module.css"

interface Notification {
  id: string
  message: string
  isRead: boolean
  createdAt: string
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.isRead).length

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications")
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
      }
    } catch {}
  }

  useEffect(() => {
    fetchNotifications()
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleOpen = async () => {
    setOpen(prev => !prev)
    // Mark all as read when opening
    if (!open && unreadCount > 0) {
      await fetch("/api/notifications", { method: "PUT" })
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    }
  }

  const handleClear = async () => {
    await fetch("/api/notifications", { method: "DELETE" })
    setNotifications([])
    setOpen(false)
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const diff = Date.now() - date.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "just now"
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <div className={styles.bellWrapper} ref={ref}>
      <button
        className="iconBtn"
        aria-label="Notifications"
        onClick={handleOpen}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "2.5rem",
          height: "2.5rem",
          borderRadius: "50%",
          color: "var(--muted)",
          transition: "var(--transition)",
          background: "transparent",
          border: "none",
          cursor: "pointer",
        }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount > 9 ? "9+" : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <span>Notifications</span>
            {notifications.length > 0 && (
              <button className={styles.clearBtn} onClick={handleClear}>
                Clear all
              </button>
            )}
          </div>
          <div className={styles.list}>
            {notifications.length === 0 ? (
              <div className={styles.empty}>No notifications yet</div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className={`${styles.item} ${!n.isRead ? styles.unread : ""}`}>
                  <div className={`${styles.dot} ${n.isRead ? styles.dotRead : ""}`} />
                  <div>
                    <div className={styles.msg}>{n.message}</div>
                    <div className={styles.time}>{formatTime(n.createdAt)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
