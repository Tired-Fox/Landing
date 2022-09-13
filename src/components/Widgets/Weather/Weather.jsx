import { h, Fragment } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { lon, lat, units, weatherkey } from '../../../data/weather';
import { DateTime } from 'luxon';

import './weather.scss';

const unitSymbols = {
    imperial: {
        temp: "℉"
    },
    metric: {
        temp: "℃"
    }
}

const aqi = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor']

const GetWeather = async () => {
    const OPEN_WEATHER_MAP = `https://api.openweathermap.org/data/2.5/weather?&lat=${lat}&lon=${lon}&units=${units}&appid=${weatherkey} `

    return (await (await fetch(OPEN_WEATHER_MAP, { "method": "GET", "headers": {} })).json());
}

const GetAirPollution = async () => {
    const OPEN_WEATHER_MAP = `https://api.openweathermap.org/data/2.5/air_pollution?&lat=${lat}&lon=${lon}&units=${units}&appid=${weatherkey} `

    return (await (await fetch(OPEN_WEATHER_MAP, { "method": "GET", "headers": {} })).json());
}

const GetForecast = async () => {
    const OPEN_WEATHER_MAP = `https://api.openweathermap.org/data/2.5/forecast?&lat=${lat}&lon=${lon}&units=${units}&appid=${weatherkey} `

    return (await (await fetch(OPEN_WEATHER_MAP, { "method": "GET", "headers": {} })).json());
}

const formatTime = (unixTS) => {
    return DateTime.fromMillis(unixTS * 1000).toFormat('t')
}

const formatDate = (unixTS) => {
    return DateTime.fromMillis(unixTS * 1000).toFormat('EEE LLL d')
}

const range = (val, first, second) => {
    return first <= deg || deg <= second;
}

const degToCompass = (num) => {
    const val = Math.floor((num / 22.5) + .5)
    const arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
    return arr[(val % 16)]
}


const parseWeather = (Weather, Pollution) => {
    let response = {}

    // TODO: Add units where applicable
    response.country = Weather.sys.country;
    response.city = Weather.name;
    response.unit = units;
    response.temp = {
        feels: Math.floor(Weather.main.feels_like),
        actual: Math.floor(Weather.main.temp),
        max: Math.floor(Weather.main.temp_max),
        min: Math.floor(Weather.main.temp_min),
        hum: Weather.main.humidity
    }
    response.sun = {
        // TODO: Format date
        rise: formatTime(Weather.sys.sunrise),
        set: formatTime(Weather.sys.sunset)
    }
    response.rain = {
        oneHour: Weather.rain ? Weather.rain["1h"] : null,
        threeHour: Weather.rain ? Weather.rain["3h"] : null
    }

    response.snow = {
        oneHour: Weather.snow ? Weather.snow["1h"] : null,
        threeHour: Weather.snow ? Weather.snow["3h"] : null
    }

    response.date = formatDate(Weather.dt)

    response.wind = {
        speed: Math.floor(Weather.wind.speed),
        dir: degToCompass(Weather.wind.deg)
    }

    response.weather = Weather.weather[0].main;
    response.description = Weather.weather[0].description;
    response.icon = `http://openweathermap.org/img/wn/${Weather.weather[0].icon}@2x.png`;
    response.aqi = aqi[Pollution.list[0].main.aqi];

    return response;
}

const parseForecast = ({ list }) => {
    console.log(list);
}

// Uses OpenWeatherMap
export function WeatherWidget({ ...props }) {

    const GetWeatherData = async () => {
        console.log(parseForecast(await GetForecast()));
        return parseWeather(await GetWeather(), await GetAirPollution());
    }

    const [weather, setWeather] = useState(null);

    useEffect(async () => {
        setWeather(await GetWeatherData());
    }, [])

    return (
        <>
            <div>
                {
                    weather &&
                    <Weather weather={weather} />
                }
            </div>
        </>
    );
}

export function Weather({ ...props }) {
    const weather = props.weather;
    return (
        <>

            <div class="weather-widget">

                <h3>{weather.date}</h3>
                <div class="weather-overall">
                    <div class="weather-desc">
                        <img src={weather.icon} alt="Weather.icon" />
                        <p>{weather.description}</p>
                    </div>
                    <div class="weather-temp">
                        <h1 title={`H: ${weather.temp.max + unitSymbols[weather.unit].temp}  L: ${weather.temp.min + unitSymbols[weather.unit].temp}`}>
                            {weather.temp.actual}<sup class="h4 poppins">{unitSymbols[weather.unit].temp}</sup>
                        </h1>
                    </div>
                    <div class="weather-additional">
                        <p title="Wind speed and direction"><strong><i class="fa-solid fa-wind"></i> {weather.wind.speed} mph {weather.wind.dir}</strong></p>
                        <p title="Air pollution"><strong><i class="fa-solid fa-virus"></i> {weather.aqi}</strong></p>
                        <p title="Feels like"><strong><i class="fa-solid fa-temperature-three-quarters"></i> {weather.temp.feels}<sup>{unitSymbols[weather.unit].temp}</sup></strong></p>
                    </div>
                </div>
                {/* <div class="hr"></div>
                <div class="forecast">
                    <h3>Forecast</h3>
                </div> */}
            </div>
        </>
    );
}
