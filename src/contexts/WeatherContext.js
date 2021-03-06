import React, { createContext, useState } from 'react'
import { getDayByLocation } from '../utils'

export const WeatherContext = createContext()

export const WeatherContextProvider = ({ children }) => {
	const [units, setUnits] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [weatherData, setWeatherData] = useState()
	const [weatherAlerts, setWeatherAlerts] = useState()

	const getWeatherData = async (locationInput) => {
		if (!locationInput) return
		setIsLoading(true)

		const apiKey = process.env.REACT_APP_API_KEY
		const fetchBylocation = `https://api.openweathermap.org/data/2.5/weather?q=${locationInput}&appid=${apiKey}`

		await fetch(fetchBylocation)
			.then((res) => res.json())
			.then((initialData) => {
				const location = initialData.name
				const lat = initialData.coord.lat
				const lon = initialData.coord.lon

				const country = initialData.sys.country
				const isImperial = country === 'US'
				if (!units) {
					isImperial ? setUnits('imperial') : setUnits('metric')
				}

				const fetchByLatLon = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=$hourly,minutely&appid=${apiKey}`

				fetch(fetchByLatLon)
					.then((res) => res.json())
					.then((data) => {
						const formattedData = [
							{
								location,
								day: 'Current',
								current: {
									temp: data.current.temp,
									feelsLike: data.current.feels_like,
									description: data.current.weather[0].description,
									icon: data.current.weather[0].icon,
								},
							},
							{
								day: 'Today',
								description: data.daily[0].weather[0].description,
								icon: data.daily[0].weather[0].icon,
								temp: data.daily[0].temp,
								feelsLike: data.daily[0].feels_like,
							},
						]

						const upcomingArray = data.daily.splice(1)
						for (let i = 0; i < upcomingArray.length; i++) {
							let weatherData = {
								day: getDayByLocation(data.timezone, i + 1),
								description: upcomingArray[i].weather[0].description,
								icon: upcomingArray[i].weather[0].icon,
								temp: upcomingArray[i].temp,
								feelsLike: upcomingArray[i].feels_like,
							}
							formattedData.push(weatherData)
						}

						setWeatherData(formattedData)
						setWeatherAlerts(data.alerts)
						setIsLoading(false)
					})
					.catch((err) => console.error(err))
			})
			.catch((err) => console.error(err))
	}

	return (
		<WeatherContext.Provider
			value={{
				isLoading,
				weatherData,
				setWeatherData,
				weatherAlerts,
				units,
				setUnits,
				getWeatherData,
			}}>
			{children}
		</WeatherContext.Provider>
	)
}
