
function resolveTemplate(template, values) {
	return template.replace(
		/\${([a-zA-Z_$][a-zA-Z_0-9$]*)}/g,
		(match, identifier) => {
			if (identifier == '$') {
				return identifier
			} else if (values.hasOwnProperty(identifier)) {
				return values[identifier]
			} else {
				return match
			}
		}
	)
}
