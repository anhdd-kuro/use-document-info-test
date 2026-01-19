import { importExportPlugin } from '@payloadcms/plugin-import-export'
import { CollectionConfig, CollectionSlug } from 'payload'
// import { CollectionSlug } from 'payload'

const AllowImportExportCollections: CollectionSlug[] = ['users', 'posts']

export const importExportPluginConfig = importExportPlugin({
  collections: AllowImportExportCollections.map((collectionSlug) => ({
    slug: collectionSlug,
    import: {},
    export: {},
  })),
  overrideExportCollection: ({ collection }) => {
    const importCustomConfig = {
      access: {
        read: ({ req }) => true,
      },
      upload: {
        disableLocalStorage: true,
      },
      admin: {
        group: 'System',
      },
      labels: {
        singular: {
          en: 'Import',
        },
        plural: {
          en: 'Imports',
        },
      },
    } satisfies Partial<CollectionConfig>

    if (collection.admin) {
      collection.admin = { ...collection.admin, ...importCustomConfig.admin }
    } else {
      collection.admin = importCustomConfig.admin
    }
    collection.access = { ...collection.access, ...importCustomConfig.access }
    collection.hooks = {
      ...(collection.hooks ?? {}),
      beforeOperation: [...(collection.hooks?.beforeOperation ?? [])],
    }
    return collection
  },
  overrideImportCollection: ({ collection }) => {
    const exportCustomConfig = {
      access: {
        read: ({ req }) => true,
      },
      upload: {
        disableLocalStorage: true,
      },
      admin: {
        group: 'System',
        defaultColumns: [
          'id',
          'filename',
          'filesize',
          'createdAt',
          'mimeType',
          'collectionSlug',
          'importMode',
          'matchField',
          'status',
        ],
      },
      labels: {
        singular: {
          en: 'Export',
        },
        plural: {
          en: 'Exports',
        },
      },
    } satisfies Partial<CollectionConfig>

    if (collection.admin) {
      collection.admin = {
        ...collection.admin,
        ...exportCustomConfig.admin,
      }
    } else {
      collection.admin = {
        ...exportCustomConfig.admin,
      }
    }
    collection.access = { ...collection.access, ...exportCustomConfig.access }
    collection.hooks = {
      ...(collection.hooks ?? {}),
      beforeOperation: [...(collection.hooks?.beforeOperation ?? [])],
    }
    return collection
  },
  debug: true, // debug remains top level
})
