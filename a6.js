// Code uses examples from in class demonstrations, slides and external sources
const BAUD_RATE = 9600; // The baud rate based on the Arduino sketch

// Create fixed canvas dimensions for better integration on the html document
const CANVAS_WIDTH = 700;
const CANVAS_HEIGHT = 400;
// Creates a distance between the two servo visualizers
const X_Y_SEPARATION = 300;

let port, connectBtn; // Declare global variables

function setup() {
  setupSerial(); // Run our serial setup function (below)

  // Create a canvas that is the size of our browser window.
  // windowWidth and windowHeight are p5 variables
  let canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  canvas.parent('sketch-holder'); // Attach the canvas element to the html structure

  // p5 text settings. BOLD and CENTER are constants provided by p5.
  // See the "Typography" section in the p5 reference: https://p5js.org/reference/
  textFont("system-ui", 24);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
}

function draw() {
  const portIsOpen = checkPort(); // Check whether the port is open (see checkPort function below)
  if (!portIsOpen) return; // If the port is not open, exit the draw loop

  const centerX = CANVAS_WIDTH / 2; // Centers coordinate of the sketch for x
  const centerY = CANVAS_HEIGHT / 2; // Centers coordinate of the sketch for y

  let str = port.readUntil("\n"); // Read from the port until the newline
  if (str.length == 0) return; // If we didn't read anything, return.
  let data = str.trim().split(','); // Reads Serial data input from arduino and splits data into arrays by comma

  let xMapped = Number(data[0]); // Establishes the first number in the array as the x mapped value
  let yMapped = Number(data[1]); // Establishes the first number in the array as the y mapped value
  
  // Step 1: Make GUI that rotates with mouse input
  angleMode(DEGREES);

  // Sets background back to black for refreshing the visuals
  background(0);

  // Sets color to white to display the x and y mapped values for better visualization
  fill(255);
  text(`X: ${xMapped}° | Y: ${yMapped}°`, centerX, 30);

  // Following Push and Pop are used to isolate transformations for the visuals
  push();

  translate(centerX - X_Y_SEPARATION /2, centerY); // Translates from center origin to the left

  let rotX = map(xMapped, 0, 180, 90, -90); // Remaps Arduino x values to better respect the visuals on the sketch
  rotate(rotX); // Applies the rotation

  triangle(-100, 0, 100, 0, 0, -150); // Draws the white triangle indicator

  // Sets the color to cyan for the circle and draws a circle
  fill('cyan'); 
  circle(0, 0, 200);
  
  // Ends first isolated visual for x axis
  pop();

  // Second isolated visual for y axis begins
  push();

  translate(centerX + X_Y_SEPARATION /2, centerY); // Translates from center origin to the right
  let rotY = map(yMapped, 0, 180, 90, -90) // Remaps Arduino y values to better respect the visuals on the sketch
  rotate(rotY); // Applies the rotation

  triangle(-100, 0, 100, 0, 0, -150); // Draws the white triangle indicator

  // Sets color to lime for the circle and draws
  fill('lime');
  circle(0, 0, 200);

  // Ends second isolated visual for y axis
  pop();

  // Get current angles for x and y by readjusting the values back to 0-180
  let angleToWriteX = int(rotX + 90);
  let angleToWriteY = int(rotY + 90);

  // Returns the data back to the Arduino to use to command the physical servo motors position
  port.write(`${angleToWriteX},${angleToWriteY}\n`);
}


// Three helper functions for managing the serial connection.

function setupSerial() {
  port = createSerial();

  // Check to see if there are any ports we have used previously
  let usedPorts = usedSerialPorts();
  if (usedPorts.length > 0) {
    // If there are ports we've used, open the first one
    port.open(usedPorts[0], BAUD_RATE);
  }

  // create a connect button for the website
  connectBtn = createButton("Connect to Arduino");
  connectBtn.parent('button-controls'); // Attach the button element to the html structure
  connectBtn.mouseClicked(onConnectButtonClicked); // When the button is clicked, run the onConnectButtonClicked function
}

function checkPort() {
  if (!port.opened()) {
    // If the port is not open, change button text
    connectBtn.html("Connect to Arduino");
    // Set background to purple
    background("purple");
    return false;
  } else {
    // Otherwise we are connected
    connectBtn.html("Disconnect");
    return true;
  }
}

function onConnectButtonClicked() {
  // When the connect button is clicked
  if (!port.opened()) {
    // If the port is not opened, we open it
    port.open(BAUD_RATE);
  } else {
    // Otherwise, we close it!
    port.close();
  }
}