import db from '../../../config/db.config.js'; // Import the database connection

import flatted from 'flatted';

export default async function handler(req, res) {
    if (req.method === 'GET') {

        try {
          // Fetch data from the database table
          const sql = "SELECT user, browser_agent, session_id, move, rotate, zoom FROM activity_logs";
          db.query(sql, (err, result) => {
      
            if (err) {
                console.error('Error updating hdr file', err);
                res.status(500).json({ error: 'Error updating hdr file' });
                return;
            }
            res.status(200).json(result);
        });
      
        } catch (error) {
          res.status(500).json({ error: 'Failed to fetch data from database' });
        }
        
      } else if (req.method === 'POST') {

        const { sessionId, browser, actionName, action  } = req.body;

        const firstAction = (actionName == "rotate") ? JSON.stringify(action) : 0;
        const secondAction = (actionName == "move") ? JSON.stringify(action) : 0;
        const thirsAction = (actionName == "zoom") ? JSON.stringify(action) : 0;
            
        const sql = 'INSERT INTO activity_logs (user, session_id, browser_agent, rotate, move, zoom) VALUES (?, ?, ?, ?, ?, ?)';
        
        db.query(sql, ["User", sessionId, browser, firstAction, secondAction, thirsAction ], (err, result) => {
          
            if (err) {
                console.error('Error saving logs:', err);
                res.status(500).json({ error: 'Error saving logs' });
                return;
          }
    
          // console.log('Location:', Location);
        //   const insertedId = result.insertId;
            console.log('Logs saving successfully', result);
            res.status(200).json({ message: 'Logs saved successfully'});
        });
    
    

    } else {

    }
}


