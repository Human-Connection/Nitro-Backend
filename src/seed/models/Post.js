module.exports = {
  id: {
    type: 'uuid',
    primary: true,
    required: true
  },
  title: 'string',
  slug: {
    type: 'string',
    unique: true,
  },
  content: 'string',
  image: 'string',
  visibility: 'string',
  disabled: 'boolean',
  deleted: 'boolean',
}
