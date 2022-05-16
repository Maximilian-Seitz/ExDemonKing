
function include(link, asAsync) {
	return new Promise((resolve, fail) => {
		const scriptElement = document.createElement('script')
		
		if (asAsync) scriptElement.setAttribute('async', '')
		scriptElement.setAttribute('src', link)
		
		scriptElement.onload = () => resolve()
		scriptElement.onerror = () => fail()
		
		document.head.appendChild(scriptElement)
	})
	/*const response = await fetch(link)
	const source = await response.text()
	
	var globalEval = eval
	globalEval(source)*/
}
