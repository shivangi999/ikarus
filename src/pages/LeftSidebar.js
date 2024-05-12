
import React, { useRef, useState } from 'react';
import Form from 'react-bootstrap/Form'; 
import Button from 'react-bootstrap/Button';
import Link from 'next/link';


const LeftSidebar = () => {
    return(
    <>
        <Form> 
            <Form.Group className="mt-4"> 
                    <Link href="/logs">
                        <Button variant="primary" size="sm" active >
                            Check all logs
                        </Button>
                    </Link>
            </Form.Group>

            <Form.Group className="mt-4"> 
                <Form.Label>Url Generated</Form.Label><br />
                <Form.Control id="url-input" as="textarea" rows={3} />
            </Form.Group> 
         
        </Form> 
    </>);

};

export default LeftSidebar;
