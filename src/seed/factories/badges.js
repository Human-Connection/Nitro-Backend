import uuid from 'uuid/v4'

export default function (params) {
  const {
    id = uuid(),
    key,
    type = 'crowdfunding',
    status = 'permanent',
    icon
  } = params

  return `
  mutation {
    CreateBadge(
      id: "${id}",
      key: "${key}",
      type: ${type},
      status: ${status},
      icon: "${icon}"
    ) { id }
  }
  `
}
