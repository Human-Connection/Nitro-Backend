module.exports = {
  id: {
    type: 'uuid',
    primary: true,
    required: true
  },
  title: 'string',
  content: 'string',
  image: 'string',
  visibility: 'string',
  disabled: 'boolean',
  deleted: 'boolean',
}
