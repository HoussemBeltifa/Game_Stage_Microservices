const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require ('@apollo/server/express4');
const bodyParser = require('body-parser');
const cors = require('cors');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');


const gameProtoPath = 'game.proto';
const stageProtoPath = 'stage.proto';
const userProtoPath = 'user.proto';

const resolvers = require('./resolvers');
const typeDefs = require('./schema');

const db = new sqlite3.Database('./database.db'); 

// Create a table for games
db.run(`
  CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY,
    title TEXT,
    description TEXT
  )
`);

// Create a table for stages
db.run(`
  CREATE TABLE IF NOT EXISTS stages (
    id INTEGER PRIMARY KEY,
    title TEXT,
    description TEXT
  )
`);

// Create a table for users
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT,
    password TEXT,
    email TEXT
  )
`);



const app = express();
app.use(bodyParser.json());

const gameProtoDefinition = protoLoader.loadSync(gameProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });
  const stageProtoDefinition = protoLoader.loadSync(stageProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });
  const userProtoDefinition = protoLoader.loadSync(userProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });
  const gameProto = grpc.loadPackageDefinition(gameProtoDefinition).game;
  const stageProto = grpc.loadPackageDefinition(stageProtoDefinition).stage;
  const userProto = grpc.loadPackageDefinition(userProtoDefinition).user;
  const clientGames = new gameProto.GameService('localhost:50051', grpc.credentials.createInsecure());
  const clientStages = new stageProto.StageService('localhost:50052', grpc.credentials.createInsecure());
  const userGames = new userProto.UserService('localhost:50053', grpc.credentials.createInsecure());

  


const server = new ApolloServer({ typeDefs, resolvers });

server.start().then(() => {
    app.use(
        cors(),
        bodyParser.json(),
        expressMiddleware(server),
      );
  });


  app.get('/game', (req, res) => {
    db.all('SELECT * FROM games', (err, rows) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json(rows);
      }
    });
  });
  
  
  app.get('/games/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM games WHERE id = ?', [id], (err, row) => {
      if (err) {
        res.status(500).send(err);
      } else if (row) {
        res.json(row);
      } else {
        res.status(404).send('Game not found.');
      }
    });
  });
  
  app.get('/stages/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM stages WHERE id = ?', [id], (err, row) => {
      if (err) {
        res.status(500).send(err);
      } else if (row) {
        res.json(row);
      } else {
        res.status(404).send('Stage not found.');
      }
    });
  });

  app.get('/stages', (req, res) => {
    db.all('SELECT * FROM stages', (err, rows) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json(rows);
      }
    });
  }
  );

  app.post('/game', (req, res) => {
    const { id, title, description } = req.body;
    db.run(
      'INSERT INTO games (id, title, description) VALUES (?, ?, ?)',
      [id, title, description],
      function (err) {
        if (err) {
          res.status(500).send(err);
        } else {
          res.json({ id, title, description });
        }
      }
    );
  });

  app.post('/stages', (req, res) => {
    const { id, title, description } = req.body;
    db.run(
      'INSERT INTO stages (id, title, description) VALUES (?, ?, ?)',
      [id, title, description],
      function (err) {
        if (err) {
          res.status(500).send(err);
        } else {
          res.json({ id, title, description });
        }
      }
    );
  });

  app.put('/game/:id', (req, res) => {
    const { title, description } = req.body;
    const gameId = req.params.id;
    db.run(
      'UPDATE games SET title = ?, description = ? WHERE id = ?',
      [title, description, gameId],
      function (err) {
        if (err) {
          res.status(500).send(err);
        } else {
          res.json({ id: gameId, title, description });
        }
      }
    );
  });
  
  app.put('/stage/:id', (req, res) => {
    const { title, description } = req.body;
    const stageId = req.params.id;
    db.run(
      'UPDATE stages SET title = ?, description = ? WHERE id = ?',
      [title, description, stageId],
      function (err) {
        if (err) {
          res.status(500).send(err);
        } else {
          res.json({ id: stageId, title, description });
        }
      }
    );
  });
  
  app.delete('/game/:id', (req, res) => {
    const gameId = req.params.id;
    db.run(
      'DELETE FROM games WHERE id = ?',
      gameId,
      function (err) {
        if (err) {
          res.status(500).send(err);
        } else {
          res.sendStatus(204);
        }
      }
    );
  });
  
  app.delete('/stage/:id', (req, res) => {
    const stageId = req.params.id;
    db.run(
      'DELETE FROM stages WHERE id = ?',
      stageId,
      function (err) {
        if (err) {
          res.status(500).send(err);
        } else {
          res.sendStatus(204);
        }
      }
    );
  });
  

  app.get('/games', (req, res) => {
    db.all('SELECT * FROM games', (err, rows) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json(rows);
      }
    });
  }
  );

  app.get('/users', (req, res) => {
    db.all('SELECT * FROM users', (err, rows) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json(rows);
      }
    });
  }
  );

  app.get('/users/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
      if (err) {
        res.status(500).send(err);
      } else if (row) {
        res.json(row);
      } else {
        res.status(404).send('User not found.');
      }
    });
  });

  
  app.post('/user', (req, res) => {
    const { id, username, password, email } = req.body;
    db.run(
      'INSERT INTO users (id, username, password, email) VALUES (?, ?, ?, ?)',
      [id, username, password, email],
      function (err) {
        if (err) {
          res.status(500).send(err);
        } else {
          res.json({ id, username, password, email });
        }
      }
    );
  });
  
  app.delete('/user/:id', (req, res) => {
    const userId = req.params.id;
    db.run(
      'DELETE FROM users WHERE id = ?',
      userId,
      function (err) {
        if (err) {
          res.status(500).send(err);
        } else {
          res.sendStatus(204);
        }
      }
    );
  });



const port = 3000;
app.listen(port, () => {
  console.log(`API Gateway running on port ${port}`);
});
