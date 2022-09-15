import { DateTime } from 'luxon';
import { lon, lat, units, weatherkey } from '../../../data/weather';

const AQI = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor', 'N/A']
const WIND = ["NonThreatening", "VeryLow", "Low", "Moderate", "High", "Extreme"]

export const windToCSS = (speed) => {
    // According to https://www.weather.gov/mlb/seasonal_wind_threat#:~:text=%22Damaging%20high%20wind%22%20with%20sustained,with%20a%20high%20wind%20warning.&text=%22A%20High%20Threat%20to%20Life,of%2040%20to%2057%20mph

    if (speed <= 19) {
        return WIND[0]
    } else if (speed == 20) {
        return WIND[1]
    } else if (range(speed, 21, 25)) {
        return WIND[2]
    } else if (range(speed, 26, 39)) {
        return WIND[3]
    } else if (range(speed, 40, 57)) {
        return WIND[4]
    } else if (speed >= 58) {
        return WIND[5]
    }
}

const formatTime = (unixTS) => {
    return DateTime.fromMillis(unixTS * 1000).toFormat('t')
}

const formatDate = (unixTS) => {
    return DateTime.fromMillis(unixTS * 1000).toFormat('EEE LLL d')
}

const getDateTime = (unixTS) => {
    return DateTime.fromMillis(unixTS * 1000);
}

const range = (val, first, second) => {
    return first <= val || val <= second;
}

const degToCompass = (num) => {
    const val = Math.floor((num / 22.5) + .5)
    const arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
    return arr[(val % 16)]
}

export const parseWeather = (Weather, Pollution) => {
    let response = {}

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
        rise: Weather.sys.sunrise ? formatTime(Weather.sys.sunrise) : null,
        set: Weather.sys.sunset ? formatTime(Weather.sys.sunset) : null
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
    response.dateTime = getDateTime(Weather.dt)

    response.wind = {
        speed: Math.floor(Weather.wind.speed),
        dir: degToCompass(Weather.wind.deg)
    }

    response.weather = Weather.weather[0].main;
    response.description = Weather.weather[0].description;
    response.icon = `http://openweathermap.org/img/wn/${Weather.weather[0].icon}@2x.png`;
    response.aqi = AQI[Pollution];
    response.cor = Weather.pop !== undefined ? Weather.pop : null

    return response;
}

export const GetWeather = async () => {
    const OPEN_WEATHER_MAP = `https://api.openweathermap.org/data/2.5/weather?&lat=${lat}&lon=${lon}&units=${units}&appid=${weatherkey} `

    return (await (await fetch(OPEN_WEATHER_MAP, { "method": "GET", "headers": {} })).json());
}

export const GetAirPollution = async (type) => {
    const OPEN_WEATHER_MAP = `https://api.openweathermap.org/data/2.5/air_pollution${type}?&lat=${lat}&lon=${lon}&units=${units}&appid=${weatherkey} `

    return (await (await fetch(OPEN_WEATHER_MAP, { "method": "GET", "headers": {} })).json());
}

export const GetForecast = async () => {
    const OPEN_WEATHER_MAP = `https://api.openweathermap.org/data/2.5/forecast?&lat=${lat}&lon=${lon}&units=${units}&appid=${weatherkey} `

    return (await (await fetch(OPEN_WEATHER_MAP, { "method": "GET", "headers": {} })).json());
}

export const parsePollution = (pollution) => {
    return { dateTime: getDateTime(pollution.dt), aqi: AQI[pollution.main.aqi] }
}

const getModePollution = (pollutionList) => {
    let fivedayPollution = {
        0: { 'Good': 0, 'Fair': 0, 'Moderate': 0, 'Poor': 0, 'Very Poor': 0 },
        1: { 'Good': 0, 'Fair': 0, 'Moderate': 0, 'Poor': 0, 'Very Poor': 0 },
        2: { 'Good': 0, 'Fair': 0, 'Moderate': 0, 'Poor': 0, 'Very Poor': 0 },
        3: { 'Good': 0, 'Fair': 0, 'Moderate': 0, 'Poor': 0, 'Very Poor': 0 },
    }

    pollutionList = pollutionList.map((pollution) => {
        return parsePollution(pollution);
    })

    const today = DateTime.now();
    for (const pol in pollutionList) {
        const day = pollutionList[pol].dateTime.day - today.day;
        fivedayPollution[day][pollutionList[pol].aqi] += 1;
    }

    for (const day in fivedayPollution) {
        let max = 0;
        for (const aqi in AQI) {
            if (fivedayPollution[day][AQI[aqi]] > fivedayPollution[day][AQI[max]]) {
                max = Number(aqi);
            }
        }
        fivedayPollution[day] = max;
    }

    return fivedayPollution;
}

const getModeForecast = (forecastList, pollutionList) => {
    let fiveDayForecast = {
        0: [],
        1: [],
        2: [],
        3: [],
        4: [],
        5: []
    }

    const today = DateTime.now();
    for (const segment in forecastList) {
        const day = getDateTime(forecastList[segment].dt).day - today.day;
        fiveDayForecast[day].push(parseWeather(forecastList[segment], pollutionList[day] !== undefined ? pollutionList[day] : 5));
    }

    return fiveDayForecast;
}

export const parseForecast = ({ list: forecastList }, { list: pollutionList }) => {
    return getModeForecast(forecastList, getModePollution(pollutionList));
}