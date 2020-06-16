import React, { useEffect, useState } from 'react'
import { message } from 'antd'
import { useRouter } from 'next/router'

import { Resource } from '../../graphql/types'
import ResourceCards from '../../components/learn/ResourceCards'
import { SEO } from '../../components/SEO'
import { titleCase } from '../../utils/titleCase'
import { client } from '../../utils/urqlClient'

export default function TopicResources() {
  const router = useRouter()
  const RESOURCES_BY_TOPIC_QUERY = `
    query($slug: String!) {
      resourcesByTopic(slug: $slug) {
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
  const [resources, setResources] = useState<Resource[]>([])

  useEffect(() => {
    client
      .query(RESOURCES_BY_TOPIC_QUERY, {
        slug: router.query.slug as string,
      })
      .toPromise()
      .then((result) => {
        if (result.error) {
          message.error(result.error.message)
        } else {
          setResources(result.data.resourcesByTopic)
        }
      })
  }, [RESOURCES_BY_TOPIC_QUERY, router.query.slug])

  return (
    <>
      <SEO title={`Resources | ${titleCase(router.query.slug as string)}`} />
      <ResourceCards resources={resources} />
    </>
  )
}
