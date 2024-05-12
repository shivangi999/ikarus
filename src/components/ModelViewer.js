// components/ModelViewer.js
import { S3 } from 'aws-sdk';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { v4 as uuidv4 } from 'uuid';

import dotenv from 'dotenv';
dotenv.config();


const ModelViewer = () => {
    const containerRef = useRef(null);
    const sceneRef = useRef(new THREE.Scene());
   
    const cameraRef = useRef(new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 2, 500));
    const rendererRef = useRef(new THREE.WebGLRenderer());
    const controlsRef = useRef(null);
    const loader = new GLTFLoader();
    const hdrLoader = new RGBELoader();
    const [materialType, setMaterialType] = useState(""); 
    const [sessionId, setSessionId] = useState(''); 
    const [modelKey, setModelKey] = useState("");
    const [hdrKey, setHdrKey] = useState("");

    useEffect( () => {

      // Aws Accesskey and secret access key

    const s3 = new S3({

      accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,

      secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,

      region: process.env.NEXT_PUBLIC_AWS_REGION,

  });

      // Decode URL parameters and set scene state

      const searchParams = new URLSearchParams(location.search);

      let modelKey = searchParams.get('modelKey');

      if(searchParams.has('modelKey'))
      {
        const params = {

          Bucket: "aws-all-ikarus3d",

          Key: modelKey,

        };

        try {
          s3.getObject(params, async (err, data) => {
            if (err) {
              console.error('Error retrieving file from S3:', err);
            } 
              // File data retrieved successfully
              const body = data.Body;
              const arrayBuffer = body.buffer; // Get the ArrayBuffer from the Uint8Array
              const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
              const url = URL.createObjectURL(blob);
                loader.load(url, (glb) => {
                  const model = glb.scene;
                  sceneRef.current.add(model);
                });

             
          });
            
        } catch (error) {
          console.error('Error retrieving file from S3:', error);

        }
      }
      


      // Hdr
      let hdrKey = searchParams.get('hdrKey');
      if(searchParams.has('hdrKey'))
      {
        const hdrparams = {

          Bucket: "aws-all-ikarus3d",
  
          Key: hdrKey,
  
        };
  
        try {
          s3.getObject(hdrparams, async (err, data) => {
            if (err) {
              console.error('Error retrieving file from S3:', err);
            } 
              // File data retrieved successfully
              const body = data.Body;
              const arrayBuffer = body.buffer; // Get the ArrayBuffer from the Uint8Array
              const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
              const url = URL.createObjectURL(blob);
  
              const texture = await new Promise((resolve, reject) => {
                hdrLoader.load(url, resolve, undefined, reject);
              });
                const renderer = rendererRef.current;
                const gen = new THREE.PMREMGenerator(renderer);
                const envMap = gen.fromEquirectangular(texture).texture;
                texture.dispose();
                gen.dispose();
                sceneRef.current.environment = envMap;
                sceneRef.current.background = envMap;
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    const data = e.target.result;
                };
          });
            
        } catch (error) {
          console.error('Error retrieving file from S3:', error);
        }
      }

      // Material will set here
      if(searchParams.has('material')){
        
        let materialParam = searchParams.get('material');
        setMaterialType(materialParam);
          const MaterialConstructor = materialParam ? THREE[materialParam] : null;
              let newMaterial;
              switch (materialParam) {
                  case 'MeshStandardMaterial':
                      newMaterial = new THREE.MeshStandardMaterial({color: '#F00', roughness: 0.2, metalness: 0.3})
                      // Green color
                      break;
                  case 'MeshBasicMaterial':
                      newMaterial = new MaterialConstructor({ color: 0xff0000 }); 
                      break;
                  case 'MeshPhongMaterial':
                      newMaterial = new MaterialConstructor({color: '#F00', shininess: 100});    

                      break;
                  case 'MeshLambertMaterial':
                      newMaterial = new MaterialConstructor({ color: 0xff0000 });
                      break;
                  default:
                      console.warn(`Material type "${materialParam}" is not recognized.`);
                      return;
              }
              sceneRef.current.traverse((node) => {
                  if (node.isMesh)  node.material = newMaterial;
              });
         
      }
     

  }, []);

  useEffect(() => {

    
    const queryParams = new URLSearchParams();
    queryParams.append('material', materialType);
    queryParams.append('modelKey', modelKey);
    queryParams.append('hdrKey', hdrKey);

    const newUrl = `${window.location.origin}?${queryParams.toString()}`;
    document.getElementById('url-input').value = newUrl;

}, [materialType]);

// Add event listener for keydown after component is mounted
useEffect(() => {
  const handleKeyDown = (event) => {
      const speed = 0.1;
      const model = sceneRef.current.children[0];
      if (!model) return; // Check if model is loaded
      switch (event.keyCode) {
          case 87: // W
              model.position.z -= speed;
              break;
          case 83: // S
              model.position.z += speed;
              break;
          case 65: // A
              model.position.x -= speed;
              break;
          case 68: // D
              model.position.x += speed;
              break;
          case 81: // Q
              model.position.y += speed;
              break;
          case 69: // E
              model.position.y -= speed;
              break;
          default:
              break;
      }
  };

  window.addEventListener('keydown', handleKeyDown);

  // Clean up event listener when component is unmounted
  return () => {
      window.removeEventListener('keydown', handleKeyDown);
  };
}, []); // Ensure to include model in the dependency array if it's being used inside handleKeyDown



    // Load 3d Model
    const loadModel = useCallback((data) => {

      loader.parse(data, '', (glb) => {
        
        const model = glb.scene;
        console.log(model);
        model.scale.set(2, 2, 2);
        sceneRef.current.add(model);

        model.traverse(function(node) {
          if (node.isMesh) 

          node.castShadow = true;
          node.receiveShadow = true;

          if (materialType !== "") {
            const MaterialConstructor = materialType ? THREE[materialType] : null;
            
            if (MaterialConstructor) {
              const newMaterial = new MaterialConstructor({ color: 0x00ff00 }); 
              node.material = newMaterial;
            } else {
              console.warn(`Material type "${materialType}" is not recognized.`);
            }
          }
        });

      }, undefined, (error) => {
        console.error('Error loading model:', error);
      });
    }, [loader, sceneRef, materialType, setMaterialType]);



    // Aws Accesskey and secret access key
    const s3 = new S3({
        accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
        region: process.env.NEXT_PUBLIC_AWS_REGION,
    });
  
    // Upload 3d model
    const handleFileUpload = async(event) => {
      
        const file = event.target.files[0];
        const fileExtension = file.name.split('.').pop();
        const randomNumber = Math.floor(Math.random() * 90000) + 10000;
        
        const params = {
          Bucket: 'aws-all-ikarus3d',
          Key: `uploads/model-${randomNumber}.${fileExtension}`,
          Body: file,
        };
        setModelKey(`uploads/model-${randomNumber}.${fileExtension}`);
        try {

          let check = await s3.upload(params).promise(); 
          const parameter = {
            id: document.getElementById('fileIdInput').value ?? '0',
           FileName: file.name,
           Location:check.Location
         };
 
          const data = {...parameter, ...params};
           const response = await fetch('/api/savefile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body:  JSON.stringify(data),
          });
          const responseData = await response.json();
          
          if (response.ok) {
            document.getElementById('fileIdInput').value = (responseData.lastId != 0) ? responseData.lastId : document.getElementById('fileIdInput').value;
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = e.target.result;
                loadModel(data);
            };
            reader.readAsArrayBuffer(file);
          } else {
            throw new Error(errorData.error || 'Error saving user');
          }
        } catch (error) {
          console.error('Error uploading file:', error);
        }
    };
  
    // Upload HDR file
    const handleHDRUpload = async (event) => {

      const file = event.target.files[0];
      const fileExtension = file.name.split('.').pop();
      const randomNumber = Math.floor(Math.random() * 90000) + 10000;
  
      const params = {
        Bucket: 'aws-all-ikarus3d',
        Key: `hdr/hdr-${randomNumber}.${fileExtension}`,
        Body: file,
      };
      setHdrKey(`hdr/hdr-${randomNumber}.${fileExtension}`);

        try {
          const check = await s3.upload(params).promise();
      
          const parameter = {
            id: document.getElementById('fileIdInput').value ?? '0',
            hdrname : `${file.name}`,
            Location: check.Location,
          };
      
          const data = { ...parameter, ...params };
          const response = await fetch('/api/savehdr', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });
          const responseData = await response.json();
          if (response.ok) {
            document.getElementById('fileIdInput').value = (responseData.lastId != 0) ? responseData.lastId : document.getElementById('fileIdInput').value;
            
          const texture = await new Promise((resolve, reject) => {
            hdrLoader.load(URL.createObjectURL(file), resolve, undefined, reject);
          });
            const renderer = rendererRef.current;
            const gen = new THREE.PMREMGenerator(renderer);
            const envMap = gen.fromEquirectangular(texture).texture;
            texture.dispose();
            gen.dispose();
            sceneRef.current.environment = envMap;
            sceneRef.current.background = envMap;
              const reader = new FileReader();
              reader.onload = (e) => {
                const data = e.target.result;
            };
            reader.readAsArrayBuffer(file);
          } else {
            throw new Error(responseData.error || 'Error saving user');
          }
      
        } catch (error) {
          console.error('Error handling HDR upload:', error);
        }
      };
      
  
    
  

    const handleMaterialChange = useCallback(async (event) => {
        // setMaterialType(event.target.value);
        const selectedMaterialType = event.target.value;
    
        if (selectedMaterialType !== 'none') {
            const MaterialConstructor = selectedMaterialType ? THREE[selectedMaterialType] : null;

            const data = {
              id: document.getElementById('fileIdInput').value ?? '0',
              materail: selectedMaterialType
            };

            const response = await fetch('/api/savematerial', {
             method: 'POST',
             headers: {
               'Content-Type': 'application/json',
             },
             body:  JSON.stringify(data),
           });
    
            if (MaterialConstructor) {
                // Create a new material with the selected type
                let newMaterial;
                switch (selectedMaterialType) {
                    case 'MeshStandardMaterial':
                        newMaterial = new THREE.MeshStandardMaterial({color: '#F00', roughness: 0.2, metalness: 0.3})
                        // Green color
                        break;
                    case 'MeshBasicMaterial':
                        newMaterial = new MaterialConstructor({ color: 0xff0000 }); 
                        break;
                    case 'MeshPhongMaterial':
                        newMaterial = new MaterialConstructor({color: '#F00', shininess: 100});    

                        break;
                    case 'MeshLambertMaterial':
                        newMaterial = new MaterialConstructor({ color: 0xff0000 });
                        break;
                    default:
                        console.warn(`Material type "${selectedMaterialType}" is not recognized.`);
                        return;
                }
                // Apply the new material to all nodes in the scene
                sceneRef.current.traverse((node) => {
                    // node.material = newMaterial
                    // node.material.color.setHex(0xff0000);
                    if (node.isMesh) {
                        
                        node.material = newMaterial;
                        // const newMesh = new THREE.Mesh(node.geometry, newMaterial);
                        // sceneRef.current.add(newMesh);
                    }
                });
            } else {
                console.warn(`Material type "${selectedMaterialType}" is not recognized.`);
            }
        }
    }, [sceneRef]);

          // Generate or retrieve session ID
          useEffect(() => {
            const existingSessionId = localStorage.getItem('sessionId');
            if (existingSessionId) {
                setSessionId(existingSessionId);
            } else {
                const newSessionId = uuidv4();
                localStorage.setItem('sessionId', newSessionId);
                setSessionId(newSessionId);
            }
        }, []);
    
        // Detect browser
        const detectBrowser = useCallback(() => {
            const userAgent = navigator.userAgent;
            let data ="Browser";
            if (userAgent.includes('Firefox')) {
                data = 'Firefox browser detected';
            } else if (userAgent.includes('Chrome')) {
                data = 'Chrome browser detected';
            } else if (userAgent.includes('Safari')) {
                data = 'Safari browser detected';
            } else {
                data = 'Other browser detected';
            }
            return data;
        }, []);

    const savemovData = async (actionName, action, sessionId, browser) => {
          
        const param ={
          sessionId:sessionId, 
          browser:browser, 
          actionName :actionName,
          action: action
        };
          const response = await fetch('/api/activitylogs', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(param),
          });
    }

    const logModelChanges = useCallback(() => {
      // Log rotation, movement, zoom changes of the model
      const model = sceneRef.current.children[0];
      if (!model) return;

      model.rotation.x += 0.01; 
      model.rotation.y += 0.01; 
      model.rotation.z += 0.01; 
  
      // Update position based on user interaction (e.g., mouse or touch movement)
      model.position.x += 0.1; 
      model.position.y += 0.1; 
      model.position.z += 0.1; 

      const sessionId = localStorage.getItem('sessionId');
      const browser = detectBrowser();
  
      const rotation = {
        x: Number(model.rotation.x).toFixed(2),
        y: Number(model.rotation.y).toFixed(2),
        z: Number(model.rotation.z).toFixed(2)
    };
    savemovData('rotate',rotation, sessionId,browser);

    const move = {
      x: Number(model.position.x).toFixed(2),
      y: Number(model.position.y).toFixed(2),
      z: Number(model.position.z).toFixed(2)    
    };
    savemovData('move',move, sessionId,browser);


    const zoom = {
      x: Number(cameraRef.current.position.x).toFixed(2),
      y: Number(cameraRef.current.position.y).toFixed(2),
      z: Number(cameraRef.current.position.z).toFixed(2) 
    };
    savemovData('zoom',zoom, sessionId,browser);

    }, []);


  useEffect(() => {
    const controls = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
    controlsRef.current = controls;

    // Add event listener for model changes
    controlsRef.current.addEventListener('change', logModelChanges);

    return () => {
      controlsRef.current.removeEventListener('change', logModelChanges);
      controlsRef.current.dispose();
    };
}, [logModelChanges]);

  
    useEffect(() => {
      
      // Renderers
      const renderer = rendererRef.current;
      
      renderer.shadowMap.enabled = true;
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0xffffff);
      containerRef.current.appendChild(renderer.domElement);
  
      // Event listeners for file input change and keydown
      document.getElementById('model-input').addEventListener('change', handleFileUpload);
      document.getElementById('hdr-input').addEventListener('change', handleHDRUpload);
      document.getElementById('material-select').addEventListener('change', handleMaterialChange);
      
      // window.addEventListener('keydown', handleKeyDown);
  
      // Initialize OrbitControls
      const controls = new OrbitControls(cameraRef.current, renderer.domElement);
      controlsRef.current = controls;
  
      // Clean up event listeners
      return () => {
        document.getElementById('model-input').removeEventListener('change', handleFileUpload);
        document.getElementById('hdr-input').removeEventListener('change', handleHDRUpload);
        document.getElementById('material-select').removeEventListener('change', handleMaterialChange);
        // window.removeEventListener('keydown', handleKeyDown);

        controls.dispose();
      };
    }, [handleFileUpload, handleHDRUpload, materialType, setMaterialType, handleMaterialChange]);
  
    useEffect(() => {
      // Camera
      const camera = cameraRef.current;
      camera.position.z = 5;
  
      // Light
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
      sceneRef.current.add(ambientLight);
  
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(5, 5, 10); 
      directionalLight.castShadow = true;
    
      // Set up shadow properties
      directionalLight.shadow.mapSize.width = 512; 
      directionalLight.shadow.mapSize.height = 512;
      directionalLight.shadow.camera.near = 0.5; 
      directionalLight.shadow.camera.far = 10;
      directionalLight.shadow.camera.intensity = 2; 
  
      // Soften shadows
      directionalLight.shadow.camera.left = -5; 
      directionalLight.shadow.camera.right = 5;
      directionalLight.shadow.camera.top = 5;
      directionalLight.shadow.camera.bottom = -5;
      directionalLight.shadow.radius = 4; 
      sceneRef.current.add(directionalLight);

      
      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        rendererRef.current.render(sceneRef.current, cameraRef.current);
        controlsRef.current.update();
      };
      animate();
    }, []);
  
  
  return <div ref={containerRef}/>;
};

export default ModelViewer;
