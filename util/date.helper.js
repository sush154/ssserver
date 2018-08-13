function dateConverter(date) {
	
	var parts = date.split("-");
	return new Date(parts[2], parts[1], parts[0]);
};

module.exports = dateConverter;