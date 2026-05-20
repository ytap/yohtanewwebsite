// wip/weather.js

const OPENWEATHER_API_KEY = "1434b5cbdf383d0400571c957b7dd29d";
const YOHTA_LAT = 41.8240;
const YOHTA_LON = -71.4128;

let currentWeather = null;

export async function updateWeatherData() {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${YOHTA_LAT}&lon=${YOHTA_LON}&units=metric&appid=${OPENWEATHER_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Weather fetch failed");

    const data = await response.json();
    currentWeather = {
      temp: Math.round(data.main.temp),
      condition: data.weather[0].main,
      windSpeed: data.wind.speed,
      windDeg: data.wind.deg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  } catch (error) {
    console.error("Weather update error:", error);
  }
  return currentWeather;
}

export function getCurrentWeather() {
  return currentWeather;
}

export function spawnBoxWithWind(opts) {
  // opts: {floor, random, margin, cols, rows, projects, boxes, ProjectBox, tileSize}
  if (!currentWeather) return;
  const { floor, random, margin, cols, rows, projects, boxes, ProjectBox, tileSize } = opts;

  let spawnGridX, spawnGridY;
  let inGrid = true;
  while (inGrid) {
    spawnGridX = floor(random(-margin, cols + margin));
    spawnGridY = floor(random(-margin, rows + margin));
    if (spawnGridX < 0 || spawnGridX >= cols || spawnGridY < 0 || spawnGridY >= rows) {
      inGrid = false;
    }
  }

  let randomProject = projects[Math.floor(Math.random() * projects.length)];
  boxes.push(new ProjectBox(randomProject, spawnGridX, spawnGridY, currentWeather.windSpeed, currentWeather.windDeg, tileSize));
}