// pages/index.js
import * as THREE from 'three';
import React, { useRef, useState } from 'react';
import { Typography, Box, Divider, CssBaseline } from '@material-ui/core';
import Toolbar from '@material-ui/core/Toolbar';
import Drawer from '@material-ui/core/Drawer';
import 'bootstrap/dist/css/bootstrap.css'; 
import Sidebar from './sidebar';
import LeftSidebar from './LeftSidebar';

import dynamic from "next/dynamic";

const ModelViewerScript = dynamic(() => import('../components/ModelViewer'),{
    ssr: false,
});

const Home = () => {
    const drawerWidth = 100; // Set your desired width
    const containerRef = useRef(null); // Define containerRef here
    const [materialType, setMaterialType] = useState(''); 
    const sceneRef = useRef(new THREE.Scene());


  return (
    <Box className='overflow-hidden'>
      <ModelViewerScript />
    <CssBaseline />
    <Drawer
      sx={{
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
      variant="permanent"
      anchor="left"
      className="bg-body-secondary"
    >
      
      <Toolbar  className='bg-body-secondary'>
      </Toolbar>
      <Divider className='bg-body-secondary'/>

      <div style={{ display: 'block',  
                  width: 400,  
                  padding: 30 }} > 
          <LeftSidebar />

      </div> 
    </Drawer>
    <Box
      component="main"
      className='bg-body-secondary'
    >
      <div ref={containerRef} sx={{margin: `60px 0 0 0` , width: `1503px`}} />
    </Box >
    <Drawer
      sx={{
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
      variant="permanent"
      anchor="right"
      className="bg-body-secondary"
    >
      
      <Toolbar  className='bg-body-secondary'>
        <h4>3d Modeling</h4>
      </Toolbar>
      <Divider className='bg-body-secondary'/>

      <div style={{ display: 'block',  
                  width: 400,  
                  padding: 30 }} > 
        <Sidebar />
      </div> 
    </Drawer>
    
  </Box>
  );
};

export default Home;
