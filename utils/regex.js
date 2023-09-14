// * Regex to check the type of useragent
const tabOrPhoneRegex =
	/(up.browser|up.link|mmp|symbian|smartphone|midp|wap|phone|android|iemobile|w3c|acs\-|alav|alca|amoi|audi|avan|benq|bird|blac|blaz|brew|cell|cldc|cmd\-|dang|doco|eric|hipt|inno|ipaq|java|jigs|kddi|keji|leno|lg\-c|lg\-d|lg\-g|lge\-|maui|maxo|midp|mits|mmef|mobi|mot\-|moto|mwbp|nec\-|newt|noki|palm|pana|pant|phil|play|port|prox|qwap|sage|sams|sany|sch\-|sec\-|send|seri|sgh\-|shar|sie\-|siem|smal|smar|sony|sph\-|symb|t\-mo|teli|tim\-|tosh|tsm\-|upg1|upsi|vk\-v|voda|wap\-|wapa|wapi|wapp|wapr|webc|winw|winw|xda|xda\-)/i;

const tabRegex = /(tablet|ipad|playbook)|(android(?!.*(mobi|opera mini)))/i;

const chromeOsRegex = /CrOS/i;

const androidRegex = /android/i;

const ipadRegex = /ipad/i;

const iphoneRegex = /iPhone/i;

export {
	tabOrPhoneRegex,
	tabRegex,
	androidRegex,
	chromeOsRegex,
	ipadRegex,
	iphoneRegex,
};
