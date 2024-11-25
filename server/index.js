import express from 'express';
import multer from 'multer';
import cors from 'cors';
import {PORT} from './KEYS.js';
import router from './Routes/model.route.js';
const app = express();
const upload = multer(); 

app.use(cors(
  {
    origin: '*',
  }
));
app.use(express.json()); 
app.use('/api/v1',router);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
