import Neode from 'neode'

const neode = new Neode.fromEnv();
neode.withDirectory(__dirname + '/models');
neode.model('User').relationship('wrote', 'relationship', 'WROTE', 'out', 'Post')

export default neode
