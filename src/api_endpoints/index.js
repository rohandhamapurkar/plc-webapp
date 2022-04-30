const isBuildVersion = process.env.NODE_ENV === "production";

const BASE_URL = isBuildVersion ? window.location.origin : "http://localhost:3000";

export default {
	USER_TEMPLATES: BASE_URL + "/v1/templates/",
	USER_DATASETS: BASE_URL + "/v1/datasets/",
	USER_JOB: BASE_URL + "/v1/jobs/",
};
