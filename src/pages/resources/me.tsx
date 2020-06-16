import React, { useEffect, useState } from 'react'
import { message } from 'antd'

import NotAuthenticated from '../../components/result/NotAuthenticated'
import { Resource } from '../../graphql/types'
import ResourceCards from '../../components/learn/ResourceCards'
import { SEO } from '../../components/SEO'
import { useAuthUser } from '../../lib/store'
import { client } from '../../utils/urqlClient'

export default function MyResources() {
  const RESOURCES_QUERY = `
    query {
      resources {
        id
        title
        description
        slug
        user {
          username
        }
        topic {
          title
          slug
          image
          imageType
        }
        firstPageSlugsPath
        verified
        published
        createdDate
      }
    }
  `
  const user = useAuthUser((state) => state.user)
  const [resources, setResources] = useState<Resource[]>([])
  useEffect(() => {
    client
      .query(RESOURCES_QUERY)
      .toPromise()
      .then((result) => {
        if (result.error) {
          message.error(result.error.message)
        } else {
          setResources(result.data.resources)
        }
      })
  }, [RESOURCES_QUERY])
  if (!user) return <NotAuthenticated />

  return (
    <>
      <SEO title={'My Resources'} />
      <ResourceCards resources={resources} />
    </>
  )
}
