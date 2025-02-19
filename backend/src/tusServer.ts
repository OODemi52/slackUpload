import path from 'path';
import { Server } from '@tus/server';
import { FileStore } from '@tus/file-store';

const tusServer = new Server({
  path: '/files',
  datastore: new FileStore({
    directory: path.join(__dirname, '../uploads'),
  }),
  respectForwardedHeaders: true,
});

export default tusServer; 