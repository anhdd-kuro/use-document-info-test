'use client'

import { useDocumentInfo } from '@payloadcms/ui'

const TestProvider = ({ children }: { children: React.ReactNode }) => {
  const { data, id, globalSlug, collectionSlug } = useDocumentInfo()
  console.table({ data, id, globalSlug, collectionSlug })

  return <div>{children}</div>
}

export default TestProvider
