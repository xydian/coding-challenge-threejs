import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import * as THREE from "three";
import * as mesh_representation from './test-mesh.json'
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper.js';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


import { Vector3 } from 'three';

function App() {
  /**
   * Reference to div rendering ThreeJS
   */
  let threeRef = useRef<HTMLDivElement>(document.createElement('div'))

  const meshRepresentation = mesh_representation["07Enbsqm9C7AQC9iyBwfSD"].mesh_representation

  /**
   * Color of the rendered ThreeJS geometrie
   */
  let color = '#173F5F'

  /* ######################################################
    Initializing ThreeJS Scene
  ####################################################### */ 
  useEffect(() => {
    initThreeJSScene()
  }, [])

  const initCamera = (): THREE.PerspectiveCamera => {
    let camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 )
    
    // hack to rotate view of camera
    camera.position.addScalar(25) 
    
    // move camera away from center
    camera.position.z = 20

    return camera
  }

  const initRenderer = (): THREE.WebGLRenderer => {
    var renderer = new THREE.WebGLRenderer()
    renderer.setSize( window.innerWidth/2, window.innerHeight/2 )

    return renderer
  }

  const initScene = (): THREE.Scene => {
    const scene = new THREE.Scene()
    scene.background = new THREE.Color( 0xf0f2f5 )
     
    return scene
  }

  /**
   * Control is used to move camera on drag & drop on scene view
   * @param camera 
   */
  const initControls = (camera: THREE.PerspectiveCamera): OrbitControls => {
    const controls = new OrbitControls( camera, threeRef.current )
    controls.rotateSpeed = 1.0
    controls.zoomSpeed = 1.2
    controls.panSpeed = 0.8

    return controls
  }

  /**
   * Adds helper grid view to provided scene
   * @param scene 
   */
  const addHelperGridToScene = (scene: THREE.Scene) => {
    const size = 50
    const divisions = 10

    const gridHelper = new THREE.GridHelper( size, divisions )
    scene.add( gridHelper )
  }

  /**
   * Returns Vector points based on positions in mesh_representations json
   */
  const getVectorPoints = () => {
    const points: THREE.Vector3[] = []
    
    let point: THREE.Vector3
    meshRepresentation.positions.forEach((el, i) => {
      if ((meshRepresentation.positions.length - i) % 3 === 0){
        point = new THREE.Vector3(meshRepresentation.positions[i], meshRepresentation.positions[i+1], meshRepresentation.positions[i+2])
        points.push(point)
      } 
    })

    return points
  }

  /**
   * Returns Normals based on normals in mesh_representations json
   */
  const getNormals = () => {
    const points: THREE.Vector3[] = []
    
    let point: THREE.Vector3
    meshRepresentation.normals.forEach((el, i) => {
      if ((meshRepresentation.normals.length - i) % 3 === 0){
        point = new THREE.Vector3(meshRepresentation.normals[i], meshRepresentation.normals[i+1], meshRepresentation.normals[i+2])
        points.push(point)
      } 
    })

    return points
  }

  const initThreeJSScene = () => {
    const scene = initScene()
    const camera = initCamera()
    const renderer = initRenderer()
    
    // use ref as a mount point of the Three.js scene instead of the document.body
    threeRef.current.appendChild( renderer.domElement )

    const geometry = new THREE.Geometry()

    const vectorPoints = getVectorPoints()

    // Add vector points to geometry object
    vectorPoints.forEach((el, i) => {
      geometry.vertices.push(el)
    })

    const controls = initControls(camera)

    const vectorNormals = getNormals()

    // Add faces to geometry object
    meshRepresentation.indices.forEach((el, i) => {
      if ( ((meshRepresentation.indices.length - i) % 3) === 0 ){
        const face = new THREE.Face3( 
          meshRepresentation.indices[i], 
          meshRepresentation.indices[i+1], 
          meshRepresentation.indices[i+2], 
          [
            vectorNormals[meshRepresentation.indices[i]], 
            vectorNormals[meshRepresentation.indices[i+1]], 
            vectorNormals[meshRepresentation.indices[i+2]], 
          ]
        )
        geometry.faces.push( face )
      }
    })

    geometry.computeBoundingSphere();

    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } )
    const mesh = new THREE.Mesh( geometry, material )

    addHelperGridToScene(scene)

    scene.add( mesh )

    // uncomment to show vertex normals
    // var helper = new VertexNormalsHelper( cube, 2, 0xff0000 );
    // scene.add( helper );

    let animate = () => {
      requestAnimationFrame( animate );
      // uncomment to rotate geometrie animation
      // mesh.rotation.x += 0.01
      // mesh.rotation.y += 0.01

      mesh.material.color.set(color)
      controls.update()
      renderer.render( scene, camera )
    }
    animate()
  }

  /* ######################################################
    Validating provided JSON file
  ####################################################### */ 
  useEffect(() => {
    validateMeshJSON()
  }, [])

  const [ validateMeshJsonMsg, setValidateMeshJsonMsg ] = useState('')

  const validateMeshJSON = () => {
    const comps = []

    if (!((meshRepresentation.positions.length % 3) === 0)){
      setValidateMeshJsonMsg('Fehler beim Erstellen')
      return
    } 

    // if (!(meshRepresentation.indices.length === (meshRepresentation.positions.length / 3))){
    //   setValidateMeshJsonMsg('Anzahl der Inidizes nicht korrekt')
    //   return
    // } 

    if (!(meshRepresentation.normals.length === meshRepresentation.positions.length)){
      setValidateMeshJsonMsg('Anzahl der Normalen nicht identisch mit der Anzahl der Positionen')
      return
    }
  }

  /**
   * Change color of geometry using a random color array
   */
  const onClickChangeColor = () => {
    let oldColor = color
    while (oldColor === color){
      color = colors[Math.floor((Math.random() * colors.length))]
    }
  }
  /**
   * Array with random colors to use to colorize geometry
   */
  const colors = [ '#173F5F', '#20639B', '#3CAEA3', '#F6D55C', '#ED553B' ]

  return (
    <div className="App">
      <div style={{margin: 20}}>
        <text style={{display: 'block'}}>Drücke, halte und bewege die Maus auf der gerenderten Szene um die Kamera Perspektive zu ändern</text>
        <text>Nutze dein Mausrad um rein oder rauszuzoomen</text>
      </div>

      {/* THREE component */}
      <div ref={threeRef} />

      <button 
        onClick={onClickChangeColor}
        style={{margin: 10}}
      >Ändere Farbe der Mesh-Geometrie</button>

      {validateMeshJsonMsg !== '' &&
        <h3>Error while validating Mesh JSON</h3>
      }
      <text style={{color: 'red'}}>{validateMeshJsonMsg}</text>
    </div>
  );
}

export default App
