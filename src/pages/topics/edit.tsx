import { message, Typography } from 'antd'
import React, { useEffect, useState } from 'react'

import { Topic, UserRole } from '../../graphql/types'
import { client } from '../../utils/urqlClient'
import EditTopic from '../../components/EditTopic'
import { useAuthUser } from '../../lib/store'
import NotAuthenticated from '../../components/result/NotAuthenticated'
import NotAuthorized from '../../components/result/NotAuthorized'

export default function EditTopics() {
  const user = useAuthUser((state) => state.user)
  const [topics, setTopics] = useState<Partial<Topic>[]>([])

  useEffect(() => {
    const TOPICS_QUERY = `
      query {
        topics {
          id
          title
          image
          imageType
        } 
      }
    `
    client
      .query(TOPICS_QUERY)
      .toPromise()
      .then((result) => {
        if (result.error) {
          message.error(result.error.message)
        } else {
          const fetchedTopics: Topic[] = result.data.topics
          fetchedTopics.sort((a, b) => {
            return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
          })
          setTopics(fetchedTopics)
        }
      })
  }, [])

  if (!user) return <NotAuthenticated />
  if (!user.roles?.includes(UserRole.Admin)) return <NotAuthorized />

  return (
    <>
      <Typography>
        <Typography.Title>Edit Topics</Typography.Title>
      </Typography>
      {topics.map((topic) => (
        <EditTopic topic={topic} key={topic.id} />
      ))}
    </>
  )
}
