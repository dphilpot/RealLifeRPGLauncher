var installedMods = [];

getNewsWorker();

storage.get('mods', function(error, data) {
    if (jQuery.isEmptyObject(data.installedMods)) {
        installedMods = [];
    } else {
        installedMods = data.installedMods;
    }

    getModInfo(showModInfo);
});

function showModInfo(jsonData, success) {
    if (debug_mode >= 1) {
        console.log('Loading mods..');
    };

    var dirList = [];
    var modList = [];
    if (success) {
        for (var i = 0; i < jsonData.length; i++) {
            var carItem = document.createElement('div');
            if (i == 0) {
                carItem.setAttribute('class', 'carousel-item active');
            } else {
                carItem.setAttribute('class', 'carousel-item');
            }

            var img = document.createElement('img');
            img.setAttribute('src', jsonData[i].ImageUrl);
            img.setAttribute('alt', jsonData[i].Id);
            img.setAttribute('class', 'img-responsive center-block');
            img.setAttribute('style', '-webkit-user-drag: none;');
            img.setAttribute('height', '300px');

            var infoDiv = document.createElement('div');
            infoDiv.setAttribute('class', 'carousel-caption');

            var infoDivHeading = document.createElement('h1');
            var node = document.createTextNode(jsonData[i].Name);
            infoDivHeading.appendChild(node);

            var infoDivPar = document.createElement('p');
            infoDivPar.setAttribute('class', "style='text-size:18'");

            var infoDivBold = document.createElement('b');

            node = document.createTextNode(" Mod ID: " + jsonData[i].Id);
            var br = document.createElement("br");
            infoDivBold.appendChild(node);
            infoDivBold.appendChild(br);
            node = document.createTextNode(jsonData[i].Description);
            infoDivBold.appendChild(node);

            var infoDivButton = document.createElement('button');
            infoDivButton.setAttribute('id', 'btn_mod_' + jsonData[i].Id);
            infoDivButton.setAttribute('class', 'button success loading-cube lighten');

            if(jsonData[i].HasGameFiles){
                //TODO explode ,
                dirList.push([jsonData[i].Id,jsonData[i].Directories]);

                modList.push([jsonData[i].Id,jsonData[i].Name]);
                node = document.createTextNode("Prüfe Updates ..");
                infoDivButton.setAttribute('onClick', 'modClick(' + jsonData[i].Id + ',"' + jsonData[i].DownloadUrl + '")');
                infoDivButton.disabled = true;
            }else{
                infoDivButton.setAttribute('class', 'button success');
                node = document.createTextNode("Spielen");
                infoDivButton.setAttribute('onClick', 'modClickPlay(' + jsonData[i].Id + ')');
            }

            infoDivButton.appendChild(node);

            var fullCheckButton = document.createElement('button');
            fullCheckButton.setAttribute('id', 'btn_full_' + jsonData[i].Id);
            fullCheckButton.setAttribute('class', 'button warning');
            node = document.createTextNode("Prüfen");
            fullCheckButton.setAttribute('onClick', 'fullCheckClick(' + jsonData[i].Id + ',"' + jsonData[i].DownloadUrl + '")');
            fullCheckButton.appendChild(node);

            if(jsonData[i].HasGameFiles){
                fullCheckButton.disabled = true;
            }

            infoDivPar.appendChild(infoDivBold);
            infoDiv.appendChild(infoDivHeading);
            infoDiv.appendChild(infoDivPar);
            infoDiv.appendChild(infoDivButton);

            if (jsonData[i].HasGameFiles) {
                infoDiv.appendChild(fullCheckButton);
            };

            carItem.appendChild(img);
            carItem.appendChild(infoDiv);

            var container = document.getElementById("crs_modList");
            container.appendChild(carItem);
        };
        if (jsonData.length == 1) {
            document.getElementById("car_left").style.visibility = 'hidden';
            document.getElementById("car_right").style.visibility = 'hidden';
        }

        //check for mod updates
        var args = {
            message: "check-mod-updates",
            dirList: dirList,
            allMods: modList
        }
        ipcRenderer.send('message-to-webwin', args);

    } else {
        if (debug_mode >= 1) {
            console.log('Error requesting Mod List: ' + jsonData);
        };
    }
}

function modClickPlay(id) {
    loadpage('server.html');
}

function fullCheckClick(id, url) {
    if (debug_mode >= 1) {
        console.log('Fullcheck started, mod ID: ' + id);
    };
    $('#btn_cancel_progress').delay(500).fadeIn('slow');
    var args = {
        message: 'start-fullcheck',
        modId: id,
        modUrl: url
    };
    notifyWin('RealLifeRPG Launcher', 'Komplette Überprüfung gestartet', 'ic_description_white_36dp_2x.png');
    ipcRenderer.send('message-to-download', args);
}

function modClick(id, url) {
    if (debug_mode >= 1) {
        console.log('Downlaod started, mod ID: ' + id);
    };
    $('#btn_cancel_progress').delay(500).fadeIn('slow');
    var args = {
        type: 1,
        message: "start-download",
        modId: id,
        modUrl: url
    }
    ipcRenderer.send('message-to-download', args);
    notifyWin('RealLifeRPG Launcher', 'Download gestartet', 'ic_file_download_white_36dp_2x.png');
}
