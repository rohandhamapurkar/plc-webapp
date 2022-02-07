const isBuildVersion = process.env.NODE_ENV === "production";

const BASE_URL = isBuildVersion ? window.location.origin : "http://localhost:7777";

export default {
	LOGIN: BASE_URL + "/common/v1.0/login",
	LOGOUT: BASE_URL + "/common/v1.0/logout",

	USER_TEMPLATES: BASE_URL + "/user/v1.0/templates",
};
