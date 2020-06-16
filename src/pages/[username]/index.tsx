import {
  Col,
  Divider,
  Row,
  Typography,
  Tag,
  message,
  Skeleton,
  Button,
} from 'antd'
import React, { useEffect, useState } from 'react'
import {
  GithubOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  SelectOutlined,
} from '@ant-design/icons'
import { useRouter } from 'next/router'

import { SEO } from '../../components/SEO'
import { User, Resource } from '../../graphql/types'
import { getUserWithProfileByUsername } from '../../graphql/queries/user'
import PageNotFound from '../../components/result/PageNotFound'
import { useAuthUser } from '../../lib/store'
import EditProfileModal from '../../components/user/EditProfileModal'
import ResourceCards from '../../components/learn/ResourceCards'
import { client } from '../../utils/urqlClient'
import Enrollments from '../../components/user/Enrollments'

const openUrlInNewTab = (url: string) => {
  window.open(url, '_blank')
}

export default function UserProfile() {
  const loggedInUser = useAuthUser((state) => state.user)
  const router = useRouter()
  const username = router.query.username as string
  const [user, setUser] = useState<Partial<User> | null | undefined>(null)
  const [error, setError] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [createdResources, setCreatedResources] = useState([] as Resource[])

  const RESOURCES_QUERY = `
    query($username: String!) {
      resourcesByUsername(username: $username) {
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

  useEffect(() => {
    getUserWithProfileByUsername({ username }).then((result) => {
      if (result.error) {
        message.error(result.message)
        setError(true)
      }
      setUser(result)
    })
  }, [username])

  useEffect(() => {
    client
      .query(RESOURCES_QUERY, { username })
      .toPromise()
      .then((result) => {
        if (result.error) {
          message.error(result.error.message)
        } else {
          setCreatedResources(result.data.resourcesByUsername)
        }
      })
  }, [RESOURCES_QUERY, username])

  if (error) {
    return <PageNotFound message={'Invalid username'} />
  }

  if (!user) {
    return <Skeleton active={true} />
  }

  return (
    <>
      <SEO title={user.name ?? ''} />
      <Row
        gutter={[14, 14]}
        className={'bg-component p-4 mt-5'}
        style={{
          marginBottom: '20px',
        }}
      >
        <Col>
          <img
            src={
              user.profile?.profilePic ? user.profile?.profilePic : '/dummy.png'
            }
            alt=""
            width={225}
            height={225}
            style={{ borderRadius: '50%' }}
          />
        </Col>
        <Col span={14}>
          <Row>
            <Typography>
              <Typography.Title>{user.name}</Typography.Title>
              {loggedInUser?.username === user.username && [
                <Button
                  key={'edit-profile'}
                  size={'large'}
                  type={'primary'}
                  className={'mb-4'}
                  onClick={() => setShowModal(true)}
                >
                  Edit Profile
                </Button>,
                <br key={'line-break'} />,
              ]}
              <Typography.Text>{user.profile?.shortBio}</Typography.Text>
            </Typography>
          </Row>
          <Row>
            <div className={'mt-3'}>
              {user.profile?.technologies.map((technology, index) => (
                <Tag color="#f50" key={index}>
                  {technology}
                </Tag>
              ))}
            </div>
          </Row>
          <Divider />
          <Row gutter={[14, 14]}>
            <Col>
              <TwitterOutlined
                onClick={() =>
                  openUrlInNewTab(user.profile?.socialLinks?.twitter ?? '')
                }
                style={{ fontSize: 'xx-large', color: '#55acee' }}
              />
            </Col>
            <Col>
              <GithubOutlined
                onClick={() =>
                  openUrlInNewTab(user.profile?.socialLinks?.github ?? '')
                }
                style={{ fontSize: 'xx-large', color: '#211F1F' }}
              />
            </Col>
            <Col>
              <LinkedinOutlined
                onClick={() =>
                  openUrlInNewTab(user.profile?.socialLinks?.linkedin ?? '')
                }
                style={{ fontSize: 'xx-large', color: '#55acee' }}
              />
            </Col>
            <Col>
              <SelectOutlined
                onClick={() =>
                  openUrlInNewTab(
                    user.profile?.socialLinks?.personalWebsite ?? ''
                  )
                }
                style={{ fontSize: 'xx-large', color: 'black' }}
              />
            </Col>
          </Row>
        </Col>
        <Col>
          <Divider
            type={'vertical'}
            style={{ borderLeftColor: 'grey', height: '100%' }}
          />
        </Col>
        <Col>
          <Row>
            <b>Email</b>
          </Row>
          <Row>
            {user.username === loggedInUser?.username
              ? user.email
              : user.profile?.isEmailPublic
              ? user.email
              : '[hidden]'}
          </Row>
          <br />
          <Row>
            <b>Company Name</b>
          </Row>
          <Row>{user.profile?.professionalDetails.currentCompanyName}</Row>
          <br />
          <Row>
            <b>Current Role</b>
          </Row>
          <Row>{user.profile?.professionalDetails.currentRole}</Row>
          <br />
          <Row>
            <b>Current Location</b>
          </Row>
          <Row>{user.profile?.professionalDetails.location}</Row>
          <br />
          <Row>
            <b>Looking for job?</b>
          </Row>
          <Row>
            {user.profile?.professionalDetails.lookingForJob ? 'Yes' : 'No'}
          </Row>
        </Col>
      </Row>
      <EditProfileModal
        visible={showModal}
        setShowModal={setShowModal}
        user={user}
      />
      <Enrollments user={user} />
      <br />
      {createdResources.length > 0 && (
        <>
          <Typography.Title level={2}>
            {loggedInUser?.id?.toString() === user.id?.toString()
              ? `Resources created by you`
              : `Resources created by ${user.name ?? user.username}`}
          </Typography.Title>
          <ResourceCards resources={createdResources} />
        </>
      )}
    </>
  )
}
