const isBuildVersion = process.env.NODE_ENV === "production";

const BASE_URL = isBuildVersion ? window.location.origin : "http://localhost:1401";

export default {
	LOGIN: BASE_URL + "/common/v1.0/login",
	REGISTER: BASE_URL + "/users/v1.0/register",
	LOGOUT: BASE_URL + "/common/v1.0/logout",
	EXTEND_USER_SESSION: BASE_URL + "Session/v0.1/extend-session",

	USER_TEMPLATES: BASE_URL + "/Templates/v1.0/",
	USER_TEMPLATE_GET_UPLOAD_URL: BASE_URL + "/Templates/v1.0/template-image",
	USER_DATASETS: BASE_URL + "/users/v1.0/datasets",
	USER_SUBMIT_JOB: BASE_URL + "/users/v1.0/job/submit",
	USER_JOBS: BASE_URL + "/users/v1.0/jobs",
};
