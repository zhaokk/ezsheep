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

    $("#labelSize").change(
        function (e) {
            var valueSelected = this.value;
            chrome.storage.local.set({
                'labelSize': valueSelected
            }, function () {
                chrome.storage.local.get('labelSize', function (result) {
                    console.log(result.labelSize);
                });
            });
        }
    );
});

function widthOnblur(input) {
    chrome.storage.local.set({
        'labelWidth': valueSelected
    }, function () {
        chrome.storage.local.get('labelWidth', function (result) {
            console.log(result.labelWidth);
        });
    });
}

function heightOnblur(input) {
    chrome.storage.local.set({
        'labelHeight': valueSelected
    }, function () {
        chrome.storage.local.get('labelHeight', function (result) {
            console.log(result.labelSize);
        });
    });
}