const protocol="https:"===window.location.protocol?"wss":"ws",port="https:"===window.location.protocol?"":":81";let gateway=`${protocol}://${window.location.hostname}${port}/ws`,websocket;function initWebSocket(){(websocket=new WebSocket(gateway)).binaryType="arraybuffer",websocket.onclose=onClose,websocket.onmessage=onMessage}const canvas=document.getElementById("canvas"),guide=document.getElementById("guide"),clearButton=document.getElementById("clearButton"),brushSizeSelector=document.getElementById("brush-select"),drawing=canvas.getContext("2d"),eraserToggle=document.getElementById("eraserToggleCheckbox");canvas.width=896,canvas.height=448;let physicalDisplayWidth=128,physicalDisplayHeight=64;const canvasMultiplier=7;let brushSize=1,horizontalCellCount=physicalDisplayWidth/brushSize,verticalCellCount=physicalDisplayHeight/brushSize,cellSideLength=canvas.width/horizontalCellCount,lastX=-1,lastY=-1,eraserOn=!1,eraserStateChanged=!1,isDrawing=!1;function onClose(e){console.log("Connection closed"),setTimeout(initWebSocket,2e3)}function parsePixelCommand(e){let t=JSON.parse(e.data);if(t.clear)drawing.fillStyle="#242526",drawing.fillRect(0,0,canvas.width,canvas.height);else{t.pixelOn?drawing.fillStyle="#FFFFFF":drawing.fillStyle="#242526";let a=7*t.x,n=7*t.y,i=canvas.width/(physicalDisplayWidth/t.size);drawing.fillRect(a,n,i,i)}}function parseCanvasState(e){let t=new Uint8Array(e.data);drawing.fillStyle="#FFFFFF";for(let a=0;a<physicalDisplayHeight;a++)for(let n=0;n<physicalDisplayWidth;n++){let i=Math.floor((a*physicalDisplayWidth+n)/8),l=7-(a*physicalDisplayWidth+n)%8;t[i]>>l&1&&drawing.fillRect(7*n,7*a,7,7)}}function onMessage(e){"string"==typeof e.data?parsePixelCommand(e):e.data instanceof ArrayBuffer&&parseCanvasState(e)}function setupGridGuides(){let e=guide.querySelectorAll("div");e.forEach(e=>e.remove()),guide.style.width=`${canvas.width}px`,guide.style.height=`${canvas.height}px`,guide.style.gridTemplateColumns=`repeat(${horizontalCellCount}, 1fr)`,guide.style.gridTemplateRows=`repeat(${verticalCellCount}, 1fr)`;for(let t=0;t<horizontalCellCount*verticalCellCount;t++)guide.insertAdjacentHTML("beforeend","<div></div>")}function sendChangeToServer(e,t){let a={clear:!1,pixelOn:!eraserOn,x:Math.floor(e/7),y:Math.floor(t/7),size:brushSize};try{websocket.send(JSON.stringify(a))}catch(n){console.log(n)}}function fillCell(e,t){sendChangeToServer(e,t),eraserOn?drawing.fillStyle="#242526":drawing.fillStyle="#FFFFFF",drawing.fillRect(e,t,cellSideLength,cellSideLength)}function mouseMoved(e){let t=canvas.getBoundingClientRect(),a=e.clientX-t.left,n=e.clientY-t.top;inputMoved(a,n)}function mouseDown(e){isDrawing=!0,mouseMoved(e)}function mouseUp(e){isDrawing=!1}function touchMoved(e){let t=canvas.getBoundingClientRect(),a=e.touches[0].clientX-t.left,n=e.touches[0].clientY-t.top;inputMoved(a,n)}function touchStart(e){e.preventDefault(),isDrawing=!0,touchMoved(e)}function inputMoved(e,t){if(isDrawing){let a=Math.floor(e/cellSideLength)*cellSideLength,n=Math.floor(t/cellSideLength)*cellSideLength;(a!=lastX||n!=lastY||eraserStateChanged)&&(eraserStateChanged=!1,fillCell(a,n),lastX=a,lastY=n)}}function clearCanvas(){let e=confirm("Are you sure you wish to clear the canvas?");if(e){drawing.fillStyle="#242526",drawing.fillRect(0,0,canvas.width,canvas.height);try{websocket.send(JSON.stringify({clear:!0}))}catch(t){console.log(t)}}}function brushChanged(e){horizontalCellCount=128/(brushSize=parseInt(e.target.value)),verticalCellCount=64/brushSize,cellSideLength=canvas.width/horizontalCellCount,setupGridGuides()}function eraserToggled(e){eraserOn=!eraserOn,eraserStateChanged=!0}drawing.fillStyle="#242526",drawing.fillRect(0,0,canvas.width,canvas.height),setupGridGuides(),initWebSocket(),canvas.addEventListener("touchstart",touchStart,{passive:!1}),canvas.addEventListener("touchend",mouseUp,{passive:!1}),canvas.addEventListener("touchcancel",mouseUp,{passive:!1}),canvas.addEventListener("touchmove",touchMoved,{passive:!1}),canvas.addEventListener("mousemove",mouseMoved),canvas.addEventListener("mousedown",mouseDown),canvas.addEventListener("mouseup",mouseUp),canvas.addEventListener("mouseout",mouseUp),brushSizeSelector.addEventListener("change",brushChanged),eraserToggle.addEventListener("change",eraserToggled),clearButton.addEventListener("click",clearCanvas);