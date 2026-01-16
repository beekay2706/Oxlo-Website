'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handler = () => {
      requestAnimationFrame(() => {
        if (!window.dataLayer) {
          console.warn("dataLayer not ready yet")
          return
        }

        const url = pathname + (searchParams.toString() ? '?' + searchParams.toString() : '')
      
        const utmParams = {}
        searchParams.forEach((value, key) => {
          if (key.startsWith('utm_')) {
            utmParams[key] = value
          }
        })

        const hasUtmParams = Object.keys(utmParams).length > 0

        if (hasUtmParams) {
          sessionStorage.setItem('utm_params', JSON.stringify(utmParams))
        }

        const storedUtmParams = sessionStorage.getItem('utm_params')
        const finalUtmParams = storedUtmParams ? JSON.parse(storedUtmParams) : {}

        window.dataLayer = window.dataLayer || []
        window.dataLayer.push({
          event: 'pageview',
          page: url,
          ...finalUtmParams
        })
      })
    };

    handler();
  }, [pathname, searchParams])

  return null
}
