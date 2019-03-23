chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

		let getUrl = window.location;
		let baseUrl = getUrl .protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1];
		if(baseUrl.includes("k2b-bulk.ebay.com.au"))
		{
			let dictionary = [];
			$('tbody.dt-rs').each(
				function(){
					let selected = $(this);
					let name =	selected.find('#BuyerIdNameEmail').find( "span:nth-child(3)" ).text();
					let number = selected.find('#PurchasedQty').find( "div" ).text();
					let variation = "";
					selected.next().find('#BuyerIdNameEmail').find("b").each(function(){
						let vari = $(this).text();
						variation =vari+"||"+variation;
					});
						// use product name first 10 char
					variation = selected.next().find('#BuyerIdNameEmail').find("a").text().substring(0,30)+"||"+variation;
					if(number != "1"){
						variation +='*'+number
					}
					let outPut = '-'+name+'-'+variation
					name = name.replace(' ','');
					name = name.replace(/\s/g, '-');
					let newPair = {
						key:name,
						value:variation
					}
					let duplicate = dictionary.find(function(element){
						if(element.key === name){
							element.value += variation;
						}
						return element.key === name;
					});
					if(!duplicate){
						dictionary.push(newPair);
					}
				}
			);
			var storage = chrome.storage.local;

			dictionary.map(function(element){

				var obj= {};
					obj[element.key]=element.value;
				storage.set(obj, function(){
					let name = element.key
					chrome.storage.local.get(name,function(result){
						console.log(name,result[name]);
					});
				});
			})

		
		}else {
			class shippingInfo {
				constructor(a2Html){
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
	
			function newJoke(){
				return new Promise(function(resolve, reject) {
					 $.ajax({
						 url: "https://icanhazdadjoke.com/",
						 type: "GET",
						 beforeSend: function(xhr){xhr.setRequestHeader('Accept', 'text/plain');},
						 success: function(data) { if(data.length>90){
							 console.log(data+"   too long");
							newJoke().then(data=>{resolve(data)})
						 }else{
							resolve(data)
						 } }
						});
					 });
				} 
	
			function print() {              
				window.print();
				   }
			function printWithoutDescription() {      
				$(".variation").addClass("no-print");       
				window.print();
				$(".variation").removeClass("no-print");
				}

			function appendOneLabel(test,haveLogo){
				var key = test.receiver.replace(/\s/g, '-');
				chrome.storage.local.get(key,function(result){
					test.variation = result[key];
					if(haveLogo){
						label = `
						<div>
						<div class="addressLabel">
							<div class="labelContent">
							<h2 class="sectionLabel">Receiver:</h2>
							<div class="address">
								<h1 class="lowWeight">${test.receiver}</h1>
								<br />
								<h1>${test.addressLine1}</h1>
								<br />
								<h1 >${test.addressLine2}</h1>
								<br />
								<h1>${test.addressLine3}</h1>
							</div>
							<div class="bottom">
								<div class="horDivider"></div>
								<div class="joke">
								<h3 class="sectionLabel">😆 Joke of the day:😆</h3>
								<br />
								<p class="jokeContent">${test.joke}</p>
								</div>
								<div class="divider"></div>
									<div class="logo">
										<img class="logoImg"/>
									</div>
							</div>
							</div>
							<div class="variation">${test.variation}</div>
						</div>
						<br class="no-print">
						</div>
						 `;
					}else {
						label = `
						<div>
						<div class="addressLabel">
							<div class="labelContent">
							<h2 class="sectionLabel">Receiver:</h2>
							<div class="address">
								<h1 class="lowWeight">${test.receiver}</h1>
								<br />
								<h1>${test.addressLine1}</h1>
								<br />
								<h1 >${test.addressLine2}</h1>
								<br />
								<h1>${test.addressLine3}</h1>
							</div>
							<div class="bottom">
								<div class="horDivider"></div>
								<div class="jokeNoLogo">
								<h3 class="sectionLabel">😆 Joke of the day:😆</h3>
								<br />
								<p class="jokeContent">${test.joke}</p>
								</div>
							</div>
							</div>
							<div class="variation">${test.variation}</div>
						</div>
						<br class="no-print">
						</div>
						 `;
					}
				
					$("body").after(label);
					$('.logoImg').each(function(){
						$(this).attr('src', test.logoUrl);
					});
			});
			
	
			}
	
			let test =  new shippingInfo($(".A2").html());
	
			let count = 0;
			let url = chrome.storage.local.get('logo',function(result){
				let haveLogo = false
				let logoUrl = ''
				if(result.logo!=undefined && result.logo.length>0){
					haveLogo = true;
					logoUrl = result.logo;
				}
					$(".A2").each(
					function(){
						count++;
						let test =new shippingInfo($(this).html());
						test.logoUrl = logoUrl
						newJoke().then((data)=>{
							test.joke = "  "+data;
							appendOneLabel(test, haveLogo);
						});
					}
				).promise().done( 
					// <div class="actions">
					// 				<a onclick="printWithoutDescription()">Print label without product detail</a>|
					// 				<a href="#" onclick="print()">Print label</a>|
					// 				<a title="coming soon" disabled>Print pick up list</a>|
					// 			</div>
					function(){
						let ad=`<div class="no-print">
						<div class="addressLabel ad">
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
				
						$("body").after(ad);
						
						$("body").css('display','none');
					}
				);
				
			});
		
		}
	}
	}, 10);
});