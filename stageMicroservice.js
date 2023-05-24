const sqlite3 = require('sqlite3').verbose();

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');


const stageProtoPath = 'stage.proto';
const stageProtoDefinition = protoLoader.loadSync(stageProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const stageProto = grpc.loadPackageDefinition(stageProtoDefinition).stage;

const stageService = {
  getStage: (call, callback) => {
    
    const notif = {
      id: call.request.stage_id,
      title: 'stage ex',
      description: 'This is an example stage.',
     
    };
    callback(null, {notif});
  },

}
const server = new grpc.Server();
server.addService(stageProto.StageService.service, stageService);
const port = 50052;
let db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
  console.error(err.message);
  throw err;
  }
  console.log('Base de données connectée.');
 });

// Create a table for stages
db.run(`
  CREATE TABLE IF NOT EXISTS stages (
    id INTEGER PRIMARY KEY,
    title TEXT,
    description TEXT
  )
`);

// Insert a sample stage into the table
// db.run(`
//   INSERT INTO stages (id, title, description)
//   VALUES (1, 'stage ex', 'This is an example stage.')
// `);

server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error('Failed to bind server:', err);
      return;
    }
  
    console.log(`Server is running on port ${port}`);
    server.start();
  });
console.log(`Stage microservice running on port ${port}`);
