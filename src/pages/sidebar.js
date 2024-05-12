
import React, { useRef, useState } from 'react';
import Form from 'react-bootstrap/Form'; 


const Sidebar = () => {

    const [materialType, setMaterialType] = useState(''); 

    return(
    <>
        <Form> 
          <input id="fileIdInput" type="hidden" value="0" />

          <Form.Group className=""> 
            <Form.Label>Upload GLB File:</Form.Label> 
            <Form.Control id="model-input" type="file" accept=".glb"  />
          </Form.Group> 

          <Form.Group className="mt-4"> 
            <Form.Label>Upload HDR file(Background Map):</Form.Label> 
            <Form.Control id="hdr-input" type="file" accept=".hdr" /> 
          </Form.Group> 

          <Form.Group className="mt-4">
              <Form.Label>Select Material:</Form.Label>
              <Form.Select aria-label="Default select example"
                  id="material-select"
                  label="Material">
                  <option>Select Material</option>
                  <option value="MeshStandardMaterial">Standard</option>
                  <option value="MeshBasicMaterial">Basic</option>
                  <option value="MeshPhongMaterial">Phong</option>
                  <option value="MeshLambertMaterial">Lambert</option>
              </Form.Select>
          </Form.Group>
        </Form> 
    </>);

};

export default Sidebar;
