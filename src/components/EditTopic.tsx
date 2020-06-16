import { Button, Form, Input, message, Select } from 'antd'
import React, { useState } from 'react'
import devIcons from 'devicon/devicon.json'
import { useRouter } from 'next/router'

import { ImageType, Topic } from '../graphql/types'
import { client } from '../utils/urqlClient'

export default function EditTopic({ topic }: { topic: Partial<Topic> }) {
  const [form] = Form.useForm()
  const [image, setImage] = useState(topic.image?.split('-')?.[0] ?? '')
  const [imageVersion, setImageVersion] = useState(
    topic.image?.split('-')?.slice(1)?.join('-') ?? ''
  )
  const router = useRouter()
  const getIconVersions = () => {
    const [icon] = devIcons.filter((icon) => icon.name === image)
    if (!icon) {
      return []
    }
    return icon.versions.font
  }
  const onFinish = async ({ title, imageType, image, imageVersion }: any) => {
    const UPDATE_TOPIC_MUTATION = `
      mutation($data: UpdateTopicInput!) {
        updateTopic(data: $data) {
          id
          title
          slug
          imageType
          image
        }
      }
    `
    const result = await client
      .mutation(UPDATE_TOPIC_MUTATION, {
        data: {
          id: topic.id,
          title,
          imageType,
          image: `${image}-${imageVersion}`,
        },
      })
      .toPromise()
    if (result.error) {
      message.error(result.error.message)
    } else {
      router.reload()
    }
  }
  return (
    <Form
      initialValues={{
        title: topic.title,
        imageType: topic.imageType,
        image,
        imageVersion,
      }}
      layout={'inline'}
      form={form}
      style={{ margin: '40px' }}
      onFinish={onFinish}
    >
      <Form.Item
        name={'title'}
        rules={[{ required: true }]}
        style={{ width: '20%' }}
      >
        <Input />
      </Form.Item>
      <Form.Item name={'imageType'} style={{ width: '20%' }}>
        <Select>
          <Select.Option key={ImageType.DevIcon} value={ImageType.DevIcon}>
            {ImageType.DevIcon}
          </Select.Option>
        </Select>
      </Form.Item>
      <Form.Item name={'image'} style={{ width: '15%' }}>
        <Select
          showSearch
          placeholder={'Select an icon for the topic'}
          filterOption={(input, option) =>
            option?.props.children.toLowerCase().indexOf(input.toLowerCase()) >=
            0
          }
          onChange={(value) => {
            setImage(value as string)
            setImageVersion('')
            form.setFieldsValue({ imageVersion: '' })
          }}
        >
          {devIcons.map((icon) => (
            <Select.Option key={icon.name} value={icon.name}>
              {icon.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name={'imageVersion'} style={{ width: '15%' }}>
        <Select onChange={(value) => setImageVersion(value as string)}>
          {getIconVersions().map((version: string) => (
            <Select.Option key={version} value={version}>
              {version}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item>
        <i
          className={`devicon-${image}-${imageVersion}`}
          style={{ fontSize: 'xx-large' }}
        />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Save
        </Button>
      </Form.Item>
    </Form>
  )
}
