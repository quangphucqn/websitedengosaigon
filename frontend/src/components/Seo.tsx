import { useEffect } from 'react'

export interface SeoProps {
  title?: string
  description?: string
  canonical?: string
  image?: string
  type?: 'website' | 'article' | 'product'
  schema?: Record<string, unknown> | Array<Record<string, unknown>>
}

const DEFAULT_TITLE = 'Đèn Gỗ Sài Gòn — Đèn gỗ thủ công, ánh sáng ở lại'
const DEFAULT_DESCRIPTION =
  'Xưởng sản xuất và thiết kế đèn gỗ thủ công tại Sài Gòn. Các dòng đèn bàn, đèn thả trần, đèn đứng, đèn ngủ gỗ tự nhiên mang ánh sáng ấm cúng cho không gian sống.'
const SITE_NAME = 'Đèn Gỗ Sài Gòn'
const BASE_URL = 'https://denthucong.site'
const DEFAULT_IMAGE = `${BASE_URL}/favicon.svg`

function setMetaTag(selector: string, attribute: 'name' | 'property', attrValue: string, content: string) {
  let element = document.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, attrValue)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

function setCanonical(href: string) {
  let element = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', 'canonical')
    document.head.appendChild(element)
  }
  element.setAttribute('href', href)
}

export function Seo({
  title,
  description,
  canonical,
  image,
  type = 'website',
  schema,
}: SeoProps) {
  useEffect(() => {
    // 1. Document Title
    const finalTitle = title
      ? title.includes(SITE_NAME)
        ? title
        : `${title} | ${SITE_NAME}`
      : DEFAULT_TITLE
    document.title = finalTitle

    // 2. Meta Description
    const finalDesc = description || DEFAULT_DESCRIPTION
    setMetaTag('meta[name="description"]', 'name', 'description', finalDesc)

    // 3. Canonical Link
    const finalUrl = canonical
      ? canonical.startsWith('http')
        ? canonical
        : `${BASE_URL}${canonical.startsWith('/') ? '' : '/'}${canonical}`
      : `${BASE_URL}${window.location.pathname}`
    setCanonical(finalUrl)

    // 4. Open Graph
    const finalImage = image
      ? image.startsWith('http')
        ? image
        : `${BASE_URL}${image.startsWith('/') ? '' : '/'}${image}`
      : DEFAULT_IMAGE

    setMetaTag('meta[property="og:title"]', 'property', 'og:title', finalTitle)
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', finalDesc)
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', finalUrl)
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', finalImage)
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', type)

    // 5. Twitter Card
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', finalTitle)
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', finalDesc)
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', finalImage)

    // 6. JSON-LD Schema
    const scriptId = 'page-schema-jsonld'
    let scriptElement = document.getElementById(scriptId) as HTMLScriptElement | null

    if (schema) {
      if (!scriptElement) {
        scriptElement = document.createElement('script')
        scriptElement.id = scriptId
        scriptElement.type = 'application/ld+json'
        document.head.appendChild(scriptElement)
      }
      scriptElement.textContent = JSON.stringify(schema)
    } else if (scriptElement) {
      scriptElement.remove()
    }

    return () => {
      // Clean up dynamic schema when leaving the page
      const currentScript = document.getElementById(scriptId)
      if (currentScript) {
        currentScript.remove()
      }
    }
  }, [title, description, canonical, image, type, schema])

  return null
}
