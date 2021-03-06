function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const img = new Image();
            img.src = reader.result;
            img.onload = () => {
                console.log(img.width);
                const elem = document.createElement('canvas');
                if (img.height * 2 > img.width) {
                    elem.height = 60;
                    elem.width = 60 / img.height * img.width;
                } else {
                    elem.width = 125;
                    elem.height = 125 / img.width * img.height;
                }

                const ctx = elem.getContext('2d');
                // img.width and img.height will contain the original dimensions
                ctx.drawImage(img, 0, 0, elem.width, elem.height);
                const data = ctx.canvas.toDataURL(img, 'image/jpeg', 1);
                $('.logoPreview').attr('src', data);
                resolve(data);
            }
        }
        reader.onerror = error => reject(error);
    });
}

$(function () {

    chrome.storage.local.get('labelHeight', function (result) {
        let height = 60;
        if(result.labelHeight != undefined){
            height = result.labelHeight;
        }
        $("#height").val(height);
    });


    chrome.storage.local.get('labelWidth', function (result) {
        let width = 100;
        if(result.labelWidth != undefined){
            height = result.labelWidth;
        }
        $("#width").val(height);
    });

    chrome.storage.local.get('logo', function (result) {
        let logoUrl = ''
        if (result.logo != undefined && result.logo.length > 0) {
            logoUrl = result.logo;
            $(".logoPreview").attr('src', logoUrl);
        }
    });

    $("#logoUpload").change(function () {
        const selectedFile = document.getElementById('logoUpload').files[0];
        console.log(selectedFile);
        getBase64(selectedFile).then((base64url) => {
            console.log(base64url)
            chrome.storage.local.set({
                'logo': base64url
            }, function () {
                chrome.storage.local.get('logo', function (result) {
                    console.log(result.logo);
                });
            });
        });

    });

    function widthOnblur(value) {
        chrome.storage.local.set({
            'labelWidth': value
        }, function () {
            chrome.storage.local.get('labelWidth', function (result) {
                console.log(result.labelWidth);
            });
        });
    }
    
    function heightOnblur(value) {
        chrome.storage.local.set({
            'labelHeight': value
        }, function () {
            chrome.storage.local.get('labelHeight', function (result) {
                console.log(result.labelHeight);
            });
        });
    }

    $("#width").blur(function () {
        widthOnblur(this.value);
    });
    
    $("#height").blur(function () {
        heightOnblur(this.value);
    });

});
