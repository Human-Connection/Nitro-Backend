module.exports = {
  id: {
    type: 'uuid',
    primary: true,
    required: true
  },
  name: 'string',
  slug: {
    type: 'string',
    unique: true,
  },
  password: 'string',
  email: 'string',
  avatar: 'string',
  role: 'string',
  disabled: 'boolean',
  deleted: 'boolean'
}
