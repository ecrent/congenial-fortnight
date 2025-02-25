const express = require('express')
const app = express()
const port = 3000

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
  console.log('somebody hit the home route');
});

app.get('/api/v1/timetables', (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      timetables: [
        {
          id: 1,
          name: 'Timetable 1',
          description: 'user 1 time table'
        },
        {
          id: 2,
          name: 'Timetable 2',
          description: 'user 2 time table'
        }
      ]
    }
  })
    }
  
);

app.get('/api/v1/timetables/:id', (req, res) => {
  console.log(req.params);
  res.status(200).json({
    status: 'success',
    data: {
      timetable: {
        name: 'default timetable',
        description: 'days in the week'
      }
    }
  }
);
});

app.post('/api/v1/timetables', (req, res) => {
  console.log(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      timetable: req.body
    }
  })
    }
);

app.put( '/api/v1/timetables/:id', (req, res) => {
  console.log(req.params.id);
  console.log(req.body);
  res.status(200).json({
    status: 'success',
    data: {
      timetable: req.body
    }
  })
    }
);

app.delete('/api/v1/timetables/:id', (req, res) => {
  console.log(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null
  })
    }
);  


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
