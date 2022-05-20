
function include(link, ...alternatives) {
	return new Promise((resolve, fail) => {
		const scriptElement = document.createElement('script')
		scriptElement.setAttribute('src', link)
		
		scriptElement.onload = () => resolve()
		scriptElement.onerror = () => {
			if (alternatives && alternatives.length > 0) {
				include
					.apply(undefined, alternatives)
					.then(resolve)
					.catch(fail)
			} else {
				fail()
			}
		}
		
		document.head.appendChild(scriptElement)
	})
}
