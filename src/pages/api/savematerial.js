import db from '../../../config/db.config.js'; // Import the database connection


export default function handler(req, res) {
  if (req.method === 'GET') {
    
      res.status(200).json("Here will add the data from url");

  } else if (req.method === 'POST') {

    const request= req.body;
    const requestId= req.body.id;
    let sql = "";
    let values = [];
  
    if(!(requestId == 0) || !(requestId == "")) {
       sql = 'UPDATE ikarus_table SET material = ? WHERE id = ?';
       values = [request.material,requestId];
    }

    db.query(sql,values, (err, result) => {
      
      if (err) {
          res.status(500).json({ error: 'Error updating 3d model file' });
          return;
      }

      const insertedId = result.insertId;
      res.status(200).json({ message: 'Material saved successfully' , lastId: insertedId});

  });
    
  
}
 else if (req.method === 'PUT') {
    
  }else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}


