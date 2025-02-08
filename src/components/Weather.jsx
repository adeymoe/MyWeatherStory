import React, { useEffect, useState } from 'react'
import './Weather.css'
import search_icon from '../assets/search.png'
import clear_icon from '../assets/clear.png'
import cloud_icon from '../assets/cloud.png'
import rain_icon from '../assets/rain.png'
import snow_icon from '../assets/snow.png'
import wind_icon from '../assets/wind.png'
import drizzle_icon from '../assets/drizzle.png'
import humidity_icon from '../assets/humidity.png'

const Weather = () => {

    const [weatherData, setWeatherData] = useState(null);
    const [city, setCity] = useState("");
    const [outfitSuggestion, setOutfitSuggestion] = useState(null);

    const allIcons = {
        "01d": clear_icon,
        '01n': clear_icon,
        "02d": cloud_icon,
        "02n": cloud_icon,
        "03d": cloud_icon,
        "03n": cloud_icon,
        "04d": drizzle_icon,
        "04n": drizzle_icon,
        "09d": rain_icon,
        "09n": rain_icon,
        "10d": rain_icon,
        "10n": rain_icon,
        "13d": snow_icon,
        "13n": snow_icon,
    }

    const search = async (city) => {
        if (city.trim() === "") {
            alert("Enter City Name");
            return;
        }
        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${import.meta.env.VITE_APP_ID}`

            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                alert(data.message);
                return

            }

            const icon = allIcons[data.weather[0].icon] || clear_icon;


            setWeatherData({
                humidity: data.main.humidity,
                windSpeed: data.wind.speed,
                temperature: Math.floor(data.main.temp),
                location: data.name,
                icon: icon
            })
            setOutfitSuggestion(null);

        } catch (error) {
            setWeatherData(false);
            console.error("Problem fetching weather details");


        }
    }

    const suggestOutfit = async () => {
        if (!weatherData) return;

        const prompt = `Suggest an outfit I can wear today in ${weatherData.location} considering the following weather conditions: 
        Temperature: ${weatherData.temperature}°C, 
        Humidity: ${weatherData.humidity}%, 
        Wind Speed: ${weatherData.windSpeed} km/h.`;

        try {

            const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                }),
            });

            const data = await response.json();
            console.log(data);

            if (data.candidates && data.candidates.length > 0) {
                setOutfitSuggestion(data.candidates[0].content.parts[0].text);
            } else {
                setOutfitSuggestion("No outfit suggestion available.");
            }
        } catch (error) {
            console.error("Error fetching outfit suggestion:", error);
            setOutfitSuggestion("Failed to fetch outfit suggestion.");
        }
    }

    useEffect(() => {
        search("Abuja");
    }, [])

    return (
        <div className='weather'>
            <div className='search-bar'>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder='Search' />
                <img src={search_icon} onClick={() => search(city)} style={{ cursor: "pointer" }} alt="" />
            </div>
            <div className='suggest-outfit'>
                <button className='suggest-btn' onClick={suggestOutfit}>Suggest Outfit</button>
            </div>
            {weatherData ? <>
                <img src={weatherData.icon} alt="" className='weather-icon' />
                <p className='temperature'>{weatherData.temperature}°c</p>
                <p className='location'>{weatherData.location}</p>
                <div className='weather-data'>
                    <div className='col'>
                        <img src={humidity_icon} alt="" />
                        <div>
                            <p>{weatherData.humidity}%</p>
                            <span>Humidity</span>
                        </div>
                    </div>
                    <div className='col'>
                        <img src={wind_icon} alt="" />
                        <div>
                            <p>{weatherData.windSpeed}km/h</p>
                            <span>Wind Speed</span>
                        </div>
                    </div>

                </div>
            </>
                :
                <>

                </>

            }
            
            {outfitSuggestion && (
                <div className="outfit-suggestion">
                    {/* <h3>Outfit Suggestions</h3> */}
                    <ul>
                        {outfitSuggestion.split('\n').map((line, index) => (
                            <li key={index}>{line}</li>
                        ))}
                    </ul>
                </div>
            )}


        </div>
    )
}

export default Weather