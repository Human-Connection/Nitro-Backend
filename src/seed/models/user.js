module.exports = {
  id: {
    type: 'uuid',
    primary: true,
    required: true
  },
  name: 'string',
  password: 'string',
  email: 'string',
  avatar: 'string',
  role: 'string',
  disabled: 'boolean',
  deleted: 'boolean'
}
