
(async () => {
	await include('scripts/showdown/dist/showdown.min.js')
	await include('scripts/template.js')
	
	async function loadText(path) {
		const response = await fetch(path, { cache: "no-cache" })
		return response.text()
	}
	
	async function loadJSON(path) {
		const response = await fetch(path, { cache: "no-cache" })
		return response.json()
	}
	
	function getURLParam(param) {
		const params = new URLSearchParams(window.location.search)
		return params.get(param)
	}
	
	function getURLWithParams(params) {
		const searchParams = new URLSearchParams(window.location.search)
		Object.entries(params).forEach(([ name, value ]) => {
			searchParams.set(name, value)
		})
		return "?" + searchParams.toString()
	}

	function addTitles(chapters, chapterTitlePattern) {
		if (chapterTitlePattern === undefined) {
			chapterTitlePattern = "${name}"
		}
		
		for (let i = 0; i < chapters.length; i++) {
			let {
				name,
				chapterTitlePatternOverride: thisTitlePattern
			} = chapters[i]

			if (thisTitlePattern === undefined) {
				thisTitlePattern = chapterTitlePattern
			}

			chapters[i].title = resolveTemplate(
				thisTitlePattern,
				{ name, num: i }
			)
		}
	}

	function setUpNavigation(chapterNum, chapters, options) {
		let { allChaptersTitle } = options || {}

		if (allChaptersTitle === undefined) {
			allChaptersTitle = "- All -"
		}

		prevBtns.forEach(btn => {
			if (chapterNum > 0) {
				btn.href = getURLWithParams({
					chapter: chapterNum - 1
				})
			} else {
				btn.setAttribute('invalid', "")
			}
		})
		
		nextBtns.forEach(btn => {
			if (chapterNum < chapters.length - 1) {
				btn.href = getURLWithParams({
					chapter: chapterNum + 1
				})
			} else {
				btn.setAttribute('invalid', "")
			}
		})

		chapterSelects.forEach(chapterSelect => {
			const allOption = document.createElement("option")
			allOption.text = allChaptersTitle
			allOption.value = 'all'
			chapterSelect.appendChild(allOption)
			
			chapters.forEach(({ title }, id) => {
				const option = document.createElement("option")
				option.text = title
				option.value = id
				chapterSelect.appendChild(option)
			})
			
			chapterSelect.value = (chapterNum >= 0) ? chapterNum : 'all'
			
			chapterSelect.onchange = () => {
				window.location.href = getURLWithParams({
					chapter: chapterSelect.value
				})
			}
		})
	}

	async function loadContent(chapterNum, chapters, options) {
		let { title, titlePattern } = options || {}

		if (titlePattern === undefined) {
			titlePattern = "${title}"
		}

		try {
			const chaptersToLoad = (chapterNum >= 0) ?
				[ chapters[chapterNum] ] :
				chapters

			let contentHTML = ''
			
			const converter = new showdown.Converter()
			for (const { file } of chaptersToLoad) {
				const chapterMarkdown = await loadText(`chapters/${file}`)
				
				contentHTML += converter.makeHtml(chapterMarkdown)
			}
			
			contentDiv.innerHTML = contentHTML

			if (chaptersToLoad.length == 1) {
				const chapterTitle = chaptersToLoad[0].title
				document.title = resolveTemplate(
					titlePattern,
					{ title, chapterTitle }
				)
			} else {
				document.title = title
			}
		} catch (e) {
			contentDiv.innerHTML = `
				<h1>Error</h1>
				<p>Error encountered while loading content!</p>
				<p>Please check your connection and reload the page.</p>
			`
			console.error(e)
		}
	}
	
	async function loadData() {
		const chapterParam = getURLParam('chapter')
		const displayAllChapters = chapterParam == 'all'
		const chapterNum = displayAllChapters ? NaN : ((- -chapterParam) || 0)
		
		const {
			title,
			allChaptersTitle,
			titlePattern,
			chapterTitlePattern,
			chapters
		} = await loadJSON('info.json')

		addTitles(chapters, chapterTitlePattern)

		setUpNavigation(chapterNum, chapters, { allChaptersTitle })

		await loadContent(chapterNum, chapters, { title, titlePattern })
		contentDiv.scrollIntoView(true)
	}
	
	
	const contentDiv = document.getElementById('content')
	const prevBtns = document.querySelectorAll('.nav .prev')
	const nextBtns = document.querySelectorAll('.nav .next')
	const chapterSelects = document.querySelectorAll('.nav select')
	
	await loadData()
})()
