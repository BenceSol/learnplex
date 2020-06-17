import {
  Button,
  Card,
  Col,
  Empty,
  message,
  Row,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd'
import React from 'react'
import { useRouter } from 'next/router'
import { TagOutlined, UserOutlined } from '@ant-design/icons'

import { ImageType, Resource } from '../../graphql/types'
import {
  togglePrimaryStatus,
  togglePublishStatus,
} from '../../utils/togglePublishStatus'

export default function ResourceCards({
  resources,
}: {
  resources: Resource[]
}) {
  const router = useRouter()
  resources = resources.sort((a, b) => (a.createdDate > b.createdDate ? -1 : 1))

  const goToTopic = async ({ e, slug }: { e: any; slug: string }) => {
    e.preventDefault()
    e.stopPropagation()
    await router.push(`/topics/${slug}`)
  }

  const goToUserResources = async ({
    e,
    username,
  }: {
    e: any
    username: string
  }) => {
    e.preventDefault()
    e.stopPropagation()
    await router.push(`/${username}/resources`)
  }

  const isAdminPage = router.asPath === '/_admin'

  const goToResource = async ({ resource }: { resource: Resource }) => {
    await router.push(`/learn/${resource.slug}`)
  }

  const TRUNCATED_LENGTH = 15
  const truncate = (str: string) =>
    str.length > TRUNCATED_LENGTH
      ? str.substr(0, TRUNCATED_LENGTH - 1) + '...'
      : str

  const TruncatedTag = ({
    children,
    value,
  }: {
    children: any
    value: string
  }) =>
    value.length > TRUNCATED_LENGTH ? (
      <Tooltip title={value}>{children}</Tooltip>
    ) : (
      children
    )

  const togglePublish = async ({
    resourceId,
    e,
  }: {
    resourceId: string
    e: any
  }) => {
    e.preventDefault()
    e.stopPropagation()
    const result = await togglePublishStatus({ resourceId })
    if (result.error) {
      message.error(result.message)
    } else {
      message.success('Status updated successfully.')
      router.reload()
    }
  }

  const togglePrimary = async ({
    resourceId,
    e,
  }: {
    resourceId: string
    e: any
  }) => {
    e.preventDefault()
    e.stopPropagation()
    const result = await togglePrimaryStatus({ resourceId })
    if (result.error) {
      message.error(result.message)
    } else {
      message.success('Status updated successfully.')
      router.reload()
    }
  }

  const adminActions = ({ resource }: { resource: Resource }) => {
    const adminActions = []
    if (resource.verified) {
      adminActions.push(<Button>Toggle Primary</Button>)
    }
    return [
      <Button
        block={true}
        type={resource.published ? 'default' : 'primary'}
        danger={resource.published}
        onClick={(e) => togglePublish({ resourceId: resource.id, e })}
      >
        {resource.published ? 'Unpublish' : 'Publish'}
      </Button>,
      <Button
        block={true}
        type={resource.verified ? 'default' : 'primary'}
        danger={resource.verified}
        onClick={(e) => togglePrimary({ resourceId: resource.id, e })}
      >
        {resource.verified ? 'Remove as Primary' : 'Make Primary'}
      </Button>,
    ]
  }

  const getActions = ({ resource }: { resource: Resource }) => {
    if (isAdminPage) {
      return adminActions({ resource })
    }
    const actions = []
    if (router.asPath === '/resources/me') {
      actions.push(
        <Button
          block={true}
          type={resource.published ? 'default' : 'primary'}
          danger={resource.published}
          onClick={(e) => togglePublish({ resourceId: resource.id, e })}
        >
          {resource.published ? 'Unpublish' : 'Publish'}
        </Button>
      )
    }
    return actions
  }

  const ResourceGrid = ({ resources }: { resources: Resource[] }) => {
    return (
      <>
        <Typography.Title className={'text-center my-3'} level={3}>
          Available Resources
        </Typography.Title>
        <Row gutter={[32, 32]} style={{ marginTop: '20px' }} className={'px-5'}>
          {resources.map((resource) => (
            <Col key={resource.id} xs={24} sm={8} md={6}>
              <Card
                className={'resource-card'}
                key={resource.id}
                hoverable
                actions={getActions({ resource })}
                onClick={() => goToResource({ resource })}
                cover={
                  resource.topic.imageType === ImageType.DevIcon ? (
                    <div className={'text-center p-4'}>
                      <i
                        className={`devicon-${resource.topic.image}`}
                        style={{ fontSize: '100px' }}
                      />
                    </div>
                  ) : (
                    <img src={resource.topic.image} alt={''} />
                  )
                }
              >
                <Card.Meta
                  title={
                    <Tooltip title={resource.title}>
                      <Typography>
                        <Typography.Title level={4} ellipsis={true}>
                          {resource.title}
                        </Typography.Title>
                      </Typography>
                    </Tooltip>
                  }
                  description={
                    <Typography>
                      <Typography.Paragraph
                        ellipsis={{
                          rows: 3,
                        }}
                      >
                        {resource.description}
                      </Typography.Paragraph>
                    </Typography>
                  }
                  style={{
                    height: '75px',
                  }}
                />
                <br />
                <br />
                <Space style={{ overflowWrap: 'normal' }}>
                  <TruncatedTag value={resource.user.username}>
                    <Tag
                      className={'cursor-pointer'}
                      color={'blue'}
                      icon={<UserOutlined />}
                      onClick={(e) =>
                        goToUserResources({
                          e,
                          username: resource.user.username,
                        })
                      }
                    >
                      {truncate(resource.user.username)}
                    </Tag>
                  </TruncatedTag>
                  <TruncatedTag value={resource.topic.slug}>
                    <Tag
                      className={'cursor-pointer'}
                      onClick={(e) =>
                        goToTopic({ e, slug: resource.topic.slug })
                      }
                      color={'magenta'}
                      icon={<TagOutlined />}
                    >
                      {truncate(resource.topic.slug)}
                    </Tag>
                  </TruncatedTag>
                </Space>
              </Card>
            </Col>
          ))}
          {resources.length === 0 && (
            <Col offset={8} md={8} className={'text-center'}>
              <Empty description={'There are no resources here.'} />
            </Col>
          )}
        </Row>
      </>
    )
  }

  return <ResourceGrid resources={resources} />
}
