import db from '../../../config/db.config.js'; // Import the database connection


export default function handler(req, res) {
  if (req.method === 'GET') {
    
      res.status(200).json("Here will add the data from url");
    
  } else if (req.method === 'POST') {

    const request= req.body;
    const requestId= req.body.id;

    // res.status(200).json({ message: 'User saved successfully', request });
    let sql ="";
    let values = [];
    
    if(requestId !== "" || requestId !== 0) {
       sql = 'UPDATE ikarus_table SET hdr = ?, hdr_url = ?, hdr_key = ? WHERE id = ?';
       values = [ request.hdrname, request.Location, request.Key, requestId];
    }
    else{
       sql = 'INSERT INTO ikarus_table (hdr, hdr_url, hdr_key) VALUES (?, ?, ?)';
       values = [request.hdrname, request.Location, request.Key];
    }

    db.query(sql,values, (err, result) => {
      
      if (err) {
          console.error('Error updating hdr file', err);
          res.status(500).json({ error: 'Error updating hdr file' });
          return;
      }

    const insertedId = result.insertId

      res.status(200).json({ message: 'HDR updated successfully' , lastId: insertedId, file_url: request.Location});

  });


}
 else if (req.method === 'PUT') {
    
  }else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}


