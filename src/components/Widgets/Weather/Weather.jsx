import { h, Fragment } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import {
    GetWeather,
    GetAirPollution,
    GetForecast,
    parseWeather,
    parseForecast
} from './_Weather';
import './weather.scss';

const unitSymbols = {
    imperial: {
        temp: "℉"
    },
    metric: {
        temp: "℃"
    }
}

export function HourlyCard({ ...props }) {

    return (
        <>
            <div class="forecast-hourly">
                <div class="time">
                    <p class="h6">{props.data.dateTime.toFormat('h a')}</p>
                </div>
                <img src={props.data.icon} alt="Forecast icon" />
                <div class="data">
                    <h3
                        class="temp"
                        title={`H: ${props.data.temp.max} | L: ${props.data.temp.min}`}
                    >
                        {props.data.temp.actual}
                    </h3>
                    <div class="extra">
                        <p class="h6"> {props.data.temp.hum}% </p>
                        <p class="h6" > <i class="fa-solid fa-droplet"></i> </p>
                        <p class="h6" > {Math.floor(props.data.cor * 100)}% </p>
                    </div>
                </div>
            </div>
        </>
    );
}

export function WeatherHourlyCards({ ...props }) {
    const forecast = props.forecast;

    return (
        <>
            <div class="forecast-day">

                <h3>{forecast[0].date}</h3>
                <div>
                    {
                        forecast.map((hour) => {
                            return (
                                <HourlyCard data={hour} />
                            );
                        })
                    }
                </div>
            </div>
        </>
    );
}

export function Forecast({ ...props }) {
    let forecast = [];
    for (const day in props.forecast) {
        forecast.push(props.forecast[day]);
    }

    return (
        <>
            {
                forecast.map((day) => {
                    return (
                        <WeatherHourlyCards forecast={day} />
                    )
                })
            }
        </>
    );
}

// Uses OpenWeatherMap
export function WeatherWidget({ ...props }) {

    const [weather, setWeather] = useState(null);
    const [forecast, setForecast] = useState(null);

    const GetWeatherData = async () => {
        return parseWeather(await GetWeather(), (await GetAirPollution('')).list[0].main.aqi);
    }

    const GetForecastData = async () => {
        return parseForecast(await GetForecast(), await GetAirPollution('/forecast'));
    }

    useEffect(async () => {
        setWeather(await GetWeatherData());
        setForecast(await GetForecastData());
    }, [])

    return (
        <>
            <div>
                {
                    weather &&
                    <Weather weather={weather} forecast={forecast} />
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
                <a href="#" onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("forecast").classList.toggle('collapse');
                }}>
                    <div class="weather-overall">
                        <div class="weather-desc">
                            <img src={weather.icon} alt="Weather.icon" />
                            {/* <p>{weather.description}</p> */}
                        </div>
                        <div class="weather-temp">
                            <h1 title={`H: ${weather.temp.max + unitSymbols[weather.unit].temp}  L: ${weather.temp.min + unitSymbols[weather.unit].temp}`}>
                                {weather.temp.actual}<sup class="h4 poppins">{unitSymbols[weather.unit].temp}</sup>
                            </h1>
                            <p class="mobile h5">H: {weather.temp.max} | L: {weather.temp.min}</p>
                        </div>
                        <div class="weather-additional">
                            <p title="Wind speed and direction"><strong><i class="fa-solid fa-wind"></i> {weather.wind.speed} mph {weather.wind.dir}</strong></p>
                            <p title="Air pollution"><strong><i class="fa-solid fa-virus"></i> {weather.aqi}</strong></p>
                            <p title="Feels like"><strong><i class="fa-solid fa-temperature-three-quarters"></i> {weather.temp.feels}<sup>{unitSymbols[weather.unit].temp}</sup></strong></p>
                        </div>
                    </div>
                </a>

                <div id="forecast" class="collapse">
                    {
                        props.forecast &&
                        <Forecast forecast={props.forecast} className="mt-5" />
                    }
                </div>

            </div>
        </>
    );
}
