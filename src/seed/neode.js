import Neode from 'neode'

const neode = new Neode.fromEnv();
neode.withDirectory(__dirname + '/models');
neode.model('user').relationship('wrote', 'relationship', 'WROTE', 'out', 'post')

export default neode
