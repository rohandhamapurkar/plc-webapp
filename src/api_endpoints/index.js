const isBuildVersion = process.env.NODE_ENV === "production";

const BASE_URL = isBuildVersion ? window.location.origin : "http://localhost:3000";

export default {
	LOGIN: BASE_URL + "/common/v1.0/login",
	REGISTER: BASE_URL + "/users/v1.0/register",
	VERIFY_OTP: BASE_URL + "/users/v1.0/verify",
	LOGOUT: BASE_URL + "/common/v1.0/logout",
	EXTEND_USER_SESSION: BASE_URL + "Session/v0.1/extend-session",

	USER_TEMPLATES: BASE_URL + "/Templates/v1.0/",
	UPLOAD_USER_TEMPLATE_IMAGE: BASE_URL + "/Templates/v1.0/template-image",
	USER_DATASETS: BASE_URL + "/Datasets/v1.0/",
	GET_USER_DATASETS: BASE_URL + "/Datasets/v1.0/datasets-list",
	GET_DATASET_DATA: BASE_URL + "/Datasets/v1.0/dataset",
	USER_SUBMIT_JOB: BASE_URL + "/Jobs/v1.0/",
	USER_JOBS: BASE_URL + "/Jobs/v1.0/jobs-list",
};
