import { h, Fragment } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { GetWeather, GetAirPollution, GetForecast, parseWeather, parseForecast } from './_Weather';
import './weather.scss';

const unitSymbols = {
    imperial: {
        temp: "℉"
    },
    metric: {
        temp: "℃"
    }
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
