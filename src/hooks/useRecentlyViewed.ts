'use client'

import { useEffect, useState, useCallback } from 'react'

export type RecentItem = {
  id: number
  type: 'package' | 'hotel' | 'activity' | 'destination' | 'flight'
  name: string
  image?: string | null
  subtitle?: string   // precio, país, etc.
  href: string
  viewedAt: number    // timestamp
}

const KEY = 'travel_recently_viewed'
const MAX = 8

function load(): RecentItem[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

function save(items: RecentItem[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(items))
}

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentItem[]>([])

  useEffect(() => {
    setItems(load())
  }, [])

  const add = useCallback((item: Omit<RecentItem, 'viewedAt'>) => {
    setItems(prev => {
      const filtered = prev.filter(i => !(i.id === item.id && i.type === item.type))
      const next = [{ ...item, viewedAt: Date.now() }, ...filtered].slice(0, MAX)
      save(next)
      return next
    })
  }, [])

  const clear = useCallback(() => {
    save([])
    setItems([])
  }, [])

  return { items, add, clear }
}
