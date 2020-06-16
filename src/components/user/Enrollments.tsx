import React, { useEffect, useState } from 'react'
import { message, Typography } from 'antd'

import { Progress, User } from '../../graphql/types'
import ResourceCards from '../../components/learn/ResourceCards'
import { client } from '../../utils/urqlClient'
import { useAuthUser } from '../../lib/store'

export default function Enrollments({ user }: { user: Partial<User> }) {
  const loggedInUser = useAuthUser((state) => state.user)
  const USER_PROGRESS_LIST_BY_USERNAME_QUERY = `
    query($username: String!) {
      userProgressListByUsername(username: $username) {
        resource {
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
        }
      }
    }
  `
  const [resources, setResources] = useState([])

  useEffect(() => {
    client
      .query(USER_PROGRESS_LIST_BY_USERNAME_QUERY, {
        username: user.username,
      })
      .toPromise()
      .then((result) => {
        if (result.error) {
          message.error(result.error.message)
        } else {
          setResources(
            result.data.userProgressListByUsername.map(
              (progress: Progress) => progress.resource
            )
          )
        }
      })
  }, [USER_PROGRESS_LIST_BY_USERNAME_QUERY, user.username])
  if (resources.length === 0) {
    return <></>
  }

  return (
    <>
      <Typography.Title level={2}>
        {loggedInUser?.id?.toString() === user.id?.toString()
          ? `Resource you are learning`
          : `Resources ${user.name ?? user.username} is learning`}{' '}
      </Typography.Title>
      <ResourceCards resources={resources} />
    </>
  )
}
