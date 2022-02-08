import moment from "moment-timezone";

let traverseObject = (obj, is, value) => {
	if (typeof is == "string") return traverseObject(obj, is.split("."), value);
	else if (is.length == 1 && value !== undefined) return (obj[is[0]] = value);
	else if (is.length == 0) return obj;
	else return traverseObject(obj[is[0]], is.slice(1), value);
};

// will have to split the result on / and then use the second one to get the extension
let base64MimeType = (encoded) => {
	var result = null;
	if (typeof encoded !== "string") {
		return result;
	}
	var mime = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
	if (mime && mime.length) {
		result = mime[1];
	}
	return result.split("/")[1];
};

let dataURLtoFile = (dataurl, filename) => {
	var arr = dataurl.split(","),
		mime = arr[0].match(/:(.*?);/)[1],
		bstr = atob(arr[1]),
		n = bstr.length,
		u8arr = new Uint8Array(n);

	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}

	return new File([u8arr], filename, { type: mime });
};

let URLtoFile = (url, fileName, contentType) => {
	return fetch(url, { headers: { "Content-Type": contentType }, mode: "no-cors" })
		.then(async (response) => {
			try {
				// const contentType = response.headers.get("content-type");
				const blob = await response.blob();
				return new File([blob], fileName, { type: contentType });
			} catch (e) {
				console.log(e);
				return null;
			}
		})
		.catch(() => {
			return null;
		});
};

let toBase64 = (file) =>
	new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result);
		reader.onerror = (error) => reject(error);
	});

export default {
	getCurrentRoute: () => {
		let hashUrl = window.location.hash.split("/");
		return hashUrl[hashUrl.length - 1];
	},
	getISODate: (date) => {
		return moment(new Date(date)).tz("Asia/Kolkata").toISOString();
	},
	getFormattedDate: (date, format, tz = "UTC") => {
		return moment(date).tz(tz).format(format);
	},
	daysUntil(dateToCheckAgainst, todayMessage = "Today") {
		let dateToCheck = moment(dateToCheckAgainst);
		let dateToday = moment();
		if (dateToday.format("DD-MM-YYYY") == dateToCheck.format("DD-MM-YYYY")) {
			return todayMessage;
		} else {
			return dateToday.to(dateToCheck);
		}
	},
	isSelectedDateCurrentDate(date) {
		let dateToCheck = moment(date).tz("Asia/Kolkata").format("DD-MM-YYYY");
		let dateToday = moment().tz("Asia/Kolkata").format("DD-MM-YYYY");
		if (dateToday == dateToCheck) {
			return true;
		}
		return false;
	},
	traverseObject,
	toBase64,
	URLtoFile,
	dataURLtoFile,
};
