chrome.extension.sendMessage({}, function (response) {
	var readyStateCheckInterval = setInterval(function () {
		if (document.readyState === "complete") {
			clearInterval(readyStateCheckInterval);

			let getUrl = window.location;
			let baseUrl = getUrl.protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1];
			if (baseUrl.includes("k2b-bulk.ebay.com.au")) {
				let dictionary = [];
				$('tbody.dt-rs').each(
					function () {
						let selected = $(this);
						let name = selected.find('#BuyerIdNameEmail').find("span:nth-child(3)").text();
						let number = selected.find('#PurchasedQty').find("div").text();
						let variation = "";
						selected.next().find('#BuyerIdNameEmail').find("b").each(function () {
							let vari = $(this).text();
							variation = vari + "||" + variation;
						});
						// use product name first 10 char
						variation = selected.next().find('#BuyerIdNameEmail').find("a").text().substring(0, 30) + "||" + variation;
						if (number != "1") {
							variation += '*' + number
						}
						let outPut = '-' + name + '-' + variation
						name = name.replace(' ', '');
						name = name.replace(/\s/g, '-');
						let newPair = {
							key: name,
							value: variation
						}
						let duplicate = dictionary.find(function (element) {
							if (element.key === name) {
								element.value += variation;
							}
							return element.key === name;
						});
						if (!duplicate) {
							dictionary.push(newPair);
						}
					}
				);
				var storage = chrome.storage.local;

				dictionary.map(function (element) {

					var obj = {};
					obj[element.key] = element.value;
					storage.set(obj, function () {
						let name = element.key
						chrome.storage.local.get(name, function (result) {
							console.log(name, result[name]);
						});
					});
				})
			} else {
				class shippingInfo {
					constructor(a2Html) {
						this.receiver = "cannot find";
						this.addressLine1 = "line1";
						this.addressLine2 = "line2";
						this.addressLine3 = "line3";
						this.addressLine4 = "line3";
						this.joke = "";
						this.logoUrl = "";
						this.convertHtmltoVariable(a2Html)
					}

					convertHtmltoVariable(params) {
						var stringArray = params.split('<br>')
						this.receiver = $(stringArray[0]).html();
						this.addressLine1 = stringArray[1];
						this.addressLine2 = stringArray[2].replace(/&nbsp;/g, ' ');
						this.addressLine3 = stringArray[3];
					}
				}

				var newJoke = () => {
					new Promise(function (resolve, reject) {
						$.ajax({
							url: "https://icanhazdadjoke.com/",
							type: "GET",
							beforeSend: function (xhr) {
								xhr.setRequestHeader('Accept', 'text/plain');
							},
							success: function (data) {
								if (data.length > 90) {
									console.log(data + "   too long");
									newJoke().then(data => {
										resolve(data)
									})
								} else {
									resolve(data)
								}
							}
						});
					});
				}

				var getLogoPromise = new Promise(function (resolve, reject) {
					chrome.storage.local.get('logo', function (result) {
						let logoUrl = ''
						if (result.logo != undefined && result.logo.length > 0) {
							logoUrl = result.logo;
						}
						resolve(logoUrl);
					});
				})

				var getWidthPromise = new Promise(function (resolve, reject) {
					chrome.storage.local.get('labelWidth', function (result) {
						let labelWidth = ''
						if (result != undefined) {
							labelWidth = result.labelWidth;
						}
						resolve(labelWidth);
					});
				})

				var getHeightPromise = new Promise(function (resolve, reject) {
					chrome.storage.local.get('labelHeight', function (result) {
						let labelHeight = ''
						if (result != undefined) {
							labelHeight = result.labelHeight;
						}
						resolve(labelHeight);
					});
				})

				var getVariationPromise = (key) => {
					return new Promise(function (resolve, reject) {
						chrome.storage.local.get(key, function (result) {
							resolve(result[key])
						});
					})
				}

				let count = 0;

				// start
				Promise.all([getLogoPromise, getWidthPromise, getHeightPromise]).then(
					(values) => start(values[0], values[1], values[2])
				)

				function start(logoUrl, labelWidth, labelHeight) {
					let customizeLabel = false;
					if (labelWidth && labelHeight && (labelWidth != "100" || labelHeight != "60")) {
						customizeLabel = true;
					}
					if (customizeLabel) {
						simpleConvert(labelWidth, labelHeight);
					} else {
						convertAddresses(logoUrl);
					}
				}

				var convertAddresses = (logoUrl) => {
					$(".A2").each(
						function () {
							count++;
							let oneLabel = new shippingInfo($(this).html());
							oneLabel.logoUrl = logoUrl;
							var key = oneLabel.receiver.replace(/\s/g, '-');
							Promise.all([newJoke(), getVariationPromise(key)]).then(
								(values) => {
									oneLabel.joke = "  " + values[0];
									oneLabel.variation = values[1]
									let labelHtmlContent = '';
									if (oneLabel.logoUrl) {
										labelHtmlContent = appendOneLabelWithLogo(oneLabel);
									} else {
										labelHtmlContent = appendOneLabelWithOutLogo(oneLabel);
									}
									appendContentToBody(labelHtmlContent);
								}
							)
						}
					).promise().done(function () {
						if (logoUrl) {
							$('.logoImg').each(function () {
								$(this).attr('src', test.logoUrl);
							});
						}
						appendAd();
					});
				}

				var simpleConvert = (labelWidth, labelHeight) => {
					$(".A2").each(
						function () {
							console.log($(this).html());
							count++;
							let oneLabel = new shippingInfo($(this).html());
							var key = oneLabel.receiver.replace(/\s/g, '-');
							getVariationPromise(key).then(
								(variation) => {
									oneLabel.variation = variation;
									let label = appendSimpleLabel(oneLabel);
									appendContentToBody(label);
									$('.addressLabel').css('width', labelWidth + 'mm');
									$('.addressLabel').css('height', labelHeight + 'mm');
								}
							);

						}
					).promise().done(function () {
						appendAd();
					});
				}

				function appendContentToBody(label) {
					$("body").before(label);
				}

				function appendSimpleLabel(labelModel) {
					return `
						<div>
						<div class="addressLabel">
							<div class="labelContent">
							<h2 class="sectionLabel">Receiver:</h2>
							<div class="address">
								<h1 class="lowWeight">${labelModel.receiver}</h1>
								<br />
								<h1>${labelModel.addressLine1}</h1>
								<br />
								<h1 >${labelModel.addressLine2}</h1>
								<br />
								<h1>${labelModel.addressLine3}</h1>
							</div>
							</div>
							<div class="variation">${labelModel.variation}</div>
						</div>
						<br class="no-print">
						</div>`;
				}

				function appendOneLabelWithOutLogo(labelModel) {
					return `<div>
					<div class="addressLabel">
						<div class="labelContent">
						<h2 class="sectionLabel">Receiver:</h2>
						<div class="address">
							<h1 class="lowWeight">${labelModel.receiver}</h1>
							<br />
							<h1>${labelModel.addressLine1}</h1>
							<br />
							<h1 >${labelModel.addressLine2}</h1>
							<br />
							<h1>${labelModel.addressLine3}</h1>
						</div>
						<div class="bottom">
							<div class="horDivider"></div>
							<div class="jokeNoLogo">
							<h3 class="sectionLabel">😆 Joke of the day:😆</h3>
							<br />
							<p class="jokeContent">${labelModel.joke}</p>
							</div>
						</div>
						</div>
						<div class="variation">${labelModel.variation}</div>
					</div>
					<br class="no-print">
					</div>
					 `;
				}

				function appendOneLabelWithLogo(labelModel) {
					return ` <div>
					<div class="addressLabel">
						<div class="labelContent">
						<h2 class="sectionLabel">Receiver:</h2>
						<div class="address">
							<h1 class="lowWeight">${labelModel.receiver}</h1>
							<br />
							<h1>${labelModel.addressLine1}</h1>
							<br />
							<h1 >${labelModel.addressLine2}</h1>
							<br />
							<h1>${labelModel.addressLine3}</h1>
						</div>
						<div class="bottom">
							<div class="horDivider"></div>
							<div class="joke">
							<h3 class="sectionLabel">😆 Joke of the day:😆</h3>
							<br />
							<p class="jokeContent">${labelModel.joke}</p>
							</div>
							<div class="divider"></div>
								<div class="logo">
									<img class="logoImg"/>
								</div>
						</div>
						</div>
						<div class="variation">${labelModel.variation}</div>
					</div>
					<br class="no-print">
					</div>
					 `;
				}


				function appendAd() {
					{
						let ad =
							`<div class="no-print">
								<div class="ad">
									<div class="labelContent">
									<div>
										<h2 >Thx for using uniphone lable printer plugin #${count}</h2><br>
										<h2 class="lowWeight">Support me so I can make ezsheep better</h2><br>
										<br>
										<a href="#" onclick="print()"><h2>Print label<h2></a>
										<br>
										<a target="_blank" href="https://www.ebay.com.au/itm/264231746340/"><h3 class="lowWeight">Buy a label printer</h3> </a> <h3> | </h3>
										<a target="_blank" href="https://www.ebay.com.au/itm/264244524815/"><h3 class="lowWeight">Buy label</h3> </a><h3> | </h3>
										<form style="display: inline-block;" action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
										<input type="hidden" name="cmd" value="_donations" />
										<input type="hidden" name="business" value="FS4TANU9XZJ7L" />
										<input type="hidden" name="currency_code" value="AUD" />
										<input type="image" src="https://www.paypalobjects.com/en_AU/i/btn/btn_donate_SM.gif" border="0" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
										<img alt="" border="0" src="https://www.paypal.com/en_AU/i/scr/pixel.gif" width="1" height="1" />
										
										</form>
									</div>
									</div>
								</div>
								<br class="no-print">
								</div>`;
						$("body").before(ad);
						$("body").css('display', 'none');
					}
				}

				//TODO check box toggle
				function printWithoutDescription() {
					$(".variation").addClass("no-print");
					window.print();
					$(".variation").removeClass("no-print");
				}

			}
		}
	}, 10);
});