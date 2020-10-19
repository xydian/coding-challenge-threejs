import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import * as THREE from "three";
import * as mesh_representation from './test-mesh.json'
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper.js';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


import { Vector3 } from 'three';

const colors = [ '#173F5F', '#20639B', '#3CAEA3', '#F6D55C', '#ED553B' ]

function App() {
  let threeRef = useRef<HTMLDivElement>(document.createElement('div'))
  const mesh = mesh_representation["07Enbsqm9C7AQC9iyBwfSD"].mesh_representation

  let color = '#173F5F'

  useEffect(() => {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
    camera.position.addScalar(25) 
    
    var renderer = new THREE.WebGLRenderer(); 
    renderer.setSize( window.innerWidth/2, window.innerHeight/2 );
    // use ref as a mount point of the Three.js scene instead of the document.body
    threeRef.current.appendChild( renderer.domElement );

    var geometry = new THREE.Geometry();

    const vectorPoints = getPointsFromPositions()
    vectorPoints.forEach((el, i) => {
      // console.log("Adding vector on Points x: " + el[0] + " y: " + el[1] + " z: " + el[2])
      geometry.vertices.push(el)
    })

    let controls = new OrbitControls( camera, threeRef.current );
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;

    const vectorNormals = getNormals()

    mesh.indices.forEach((el, i) => {
      // console.log(mesh.indices.length - i % 3)
      if (((mesh.indices.length - i) % 3) === 0){
        // console.log("Adding face on Points x: " + mesh.indices[i] + " y: " + mesh.indices[i+1] + " z: " + mesh.indices[i+2])
        const face = new THREE.Face3( 
          mesh.indices[i], 
          mesh.indices[i+1], 
          mesh.indices[i+2], 
          [
            vectorNormals[mesh.indices[i]], 
            vectorNormals[mesh.indices[i+1]], 
            vectorNormals[mesh.indices[i+2]], 
          ]
        )
        geometry.faces.push( face );
      }
    })

    // geometry.computeVertexNormals();

    geometry.computeBoundingSphere();


    var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    var cube = new THREE.Mesh( geometry, material );

    // var helper = new VertexNormalsHelper( cube, 2, 0xff0000 );

    var size = 50;
    var divisions = 10;

    var gridHelper = new THREE.GridHelper( size, divisions );
    scene.add( gridHelper );

    scene.add( cube );
    // scene.add( helper );

    scene.background = new THREE.Color( 0xf0f2f5 );

    camera.position.z = 20;
    // camera.position.y = 7
    // camera.position.x= 6
    var animate = function () {
      requestAnimationFrame( animate );
      // cube.rotation.x += 0.01;
      // cube.rotation.y += 0.01;

      // cube.rotation.z += 0.01; 

      cube.material.color.set(color)
      controls.update();
      renderer.render( scene, camera ); 
    };
    animate();
  }, [])

  useEffect(() => {
    validateMeshJSON()
  }, [])
  const validateMeshJSON = () => {
    const comps = []

    comps.push(
      <p>{'Es gibt insgesamt: ' + mesh.positions.length + ' Punkte im Raum'}</p>
    )

    comps.push(
      <p>{'Es gibt insgesamt: ' + mesh.indices.length + ' Indizes'}</p>
    )

    comps.push(
      <p>{'Es gibt insgesamt: ' + mesh.normals.length + ' Normalen der Vektoren'}</p>
    )

    if ((mesh.positions.length % 3) === 0){
      comps.push(
        <p>Anzahl der Positions korrekt</p>
      )
    } else {
      comps.push(
        <p>Anzahl der Positions nicht durch drei teilbar, nicht genügend oder zu viele Werte</p>
      )
    }

    if (mesh.indices.length === (mesh.positions.length / 3)){
      comps.push(<p>Anzahl der Indizes korrekt</p>)
    } else {
      comps.push(<p>Anzahl der Indizes nicht korrekt (sollten {mesh.positions.length / 3} Indizes sein)</p>)
    }

    if (mesh.normals.length === mesh.positions.length){
      comps.push(<p>Anzahl der Normalen korrekt</p>)
    } else {
      comps.push(<p>Anzahl der Normalen nicht korrekt</p>)
    }

    return comps
  }

  const [ meshInfo, setMeshInfo ] = useState('')

  const onClickChangeColor = () => {
    let randomColor = color
    while (randomColor === color){
      color = colors[Math.floor((Math.random() * 5))]
    }
  }

  const getPointsFromPositions = () => {
    let points: THREE.Vector3[] = []
    
    let point: THREE.Vector3
    mesh.positions.forEach((el, i) => {
      if ((mesh.positions.length - i) % 3 === 0){
        point = new THREE.Vector3(mesh.positions[i], mesh.positions[i+1], mesh.positions[i+2])
        points.push(point)
      } 
    })

    // console.log('Got ' + points.length + ' Points')

    return points
  }

  const getNormals = () => {
    let points: THREE.Vector3[] = []
    
    let point: THREE.Vector3
    mesh.normals.forEach((el, i) => {
      if ((mesh.normals.length - i) % 3 === 0){
        point = new THREE.Vector3(mesh.normals[i], mesh.normals[i+1], mesh.normals[i+2])
        points.push(point)
      } 
    })

    console.log('Got ' + points.length + ' Points')

    return points
  }

  return (
    <div 
      className="App"
      
    >
      <div ref={threeRef} />

      <button onClick={onClickChangeColor}>Ändere Farbe der Mesh-Geometrie</button>
      <h2>Mesh check info</h2>
      <div>{validateMeshJSON()}</div>
    </div>
  );
}

export default App;
