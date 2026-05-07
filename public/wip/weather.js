// API Key
const OPENWEATHER_API_KEY = "1434b5cbdf383d0400571c957b7dd29d"; 

function spawnBoxWithWind() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          // Request
          const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`;
          const response = await fetch(url);
          
          if (!response.ok) {
            throw new Error(`HTTP error: status ${response.status}`);
          }
          
          const data = await response.json();
          
          // wind data
          const windSpeed = data.wind.speed;
          const windDirection = data.wind.deg;
          
          let dummyLink = "https://example.com";
          let spawnGridX, spawnGridY;
          let inGrid = true;

          // box spawning
            while (inGrid) {
            spawnGridX = floor(random(-margin, cols + margin));
            spawnGridY = floor(random(-margin, rows + margin));
            //cs 1230 ahh code

            if (spawnGridX < 0 || spawnGridX >= cols || spawnGridY < 0 || spawnGridY >= rows) {
              inGrid = false;
            }
          }

          //open a random project
          let randomProject = projects[Math.floor(Math.random() * projects.length)];

        // create projectbox
        boxes.push(new ProjectBox(randomProject, spawnGridX, spawnGridY, windSpeed, windDirection, tileSize));

        } catch (error) {
          console.error("failed to gain weather data...", error);
        }
      },
      (error) => {
        console.error("didn't get place maybe?", error);
      }
    );
  } else {
    console.error("Geolocation API not supported?");
  }
}