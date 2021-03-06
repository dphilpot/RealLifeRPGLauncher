var armaPath = "";

storage.get('settings', function(error, data) {
    if (data.armapath == "") {
        var dialog = $('#dialog_noPath').data('dialog');
        dialog.open();
    } else {
        armaPath = data.armapath;
        getServerInfo(getServerCallback);
    };
});

function getServerCallback(jsObj) {
    if (jsObj.length > 0) {
        defaultServer = jsObj[0].Id;
        for (var i = 0; i < jsObj.length; i++) {
            if(jsObj[i].appId == 107410){
                insertServerTab(jsObj[i], i,true);
            }else{
                insertServerTab(jsObj[i], i,false);
            };
        };
        $(function() {
            $("#tabcontroller").tabcontrol();
        });
        $('#tabcontroller').css({
            'visibility': 'visible'
        });
        $('#serverpreloader').remove();
    }
}

function insertServerTab(serverObj, index,isArma) {
    if (serverObj.online != 0) {
        //build server info
        var wrapper = document.createElement('div');
        wrapper.setAttribute('class', 'frame');
        wrapper.setAttribute('id', ('server_' + serverObj.Id));

        var row = document.createElement('div');
        row.setAttribute('class', 'row');

        var col4 = document.createElement('div');
        col4.setAttribute('class', 'col-md-4');
        col4.setAttribute('style', 'height:100%');

        var charDiv = document.createElement('div');
        charDiv.setAttribute('id', 'char_server_' + serverObj.Id);
        charDiv.setAttribute('style', 'min-width: 20%; height: 200px;');

        var br = document.createElement("br");
        var br2 = document.createElement("br");
        var txtPlayers = document.createTextNode("Aktuelle Spieler: " + serverObj.Players + "/" + serverObj.Slots);
        var txtIp = document.createTextNode("IP: " + serverObj.IpAddress + " Port: " + serverObj.Port);

        var btnJoin = document.createElement('button');
        btnJoin.setAttribute('class', 'button loading-pulse lighten success');
        btnJoin.setAttribute('style', 'margin-top:20px');
        btnJoin.setAttribute('id', ('btn_start_' + serverObj.Id));
        if(isArma){
            btnJoin.setAttribute('onclick', 'joinArmaServer("' + serverObj.IpAddress + '","' + serverObj.Port + '","' + serverObj.ServerPassword + '","' + serverObj.StartParameters + '")');
        }else{
            btnJoin.setAttribute('onclick', 'joinSteamServer("' + serverObj.IpAddress + '","' + serverObj.Port + '","' + serverObj.ServerPassword + '")');
        }

        var txtBtnJoin = document.createTextNode(" Server beitreten");
        btnJoin.appendChild(txtBtnJoin);

        col4.appendChild(charDiv);
        col4.appendChild(txtPlayers);
        col4.appendChild(br);
        col4.appendChild(txtIp);
        col4.appendChild(br2);
        col4.appendChild(btnJoin);
        row.appendChild(col4);

        //build player list
        var col8 = document.createElement('div');
        col8.setAttribute('class', 'col-md-8');

        var tbWrapper = document.createElement('div');
        tbWrapper.setAttribute('id', 'table-wrapper');

        var tbScroll = document.createElement('div');
        tbScroll.setAttribute('id', 'table-scroll');

        var tbl = document.createElement('table');
        tbl.setAttribute('class', 'table');


        var tblHead = document.createElement('thead');
        var tblHeadRow = document.createElement('tr');
        var tblHeadRowH = document.createElement('th');

        tblHead.appendChild(tblHeadRow);

        var tblBody = document.createElement('tbody');
        tblBody.setAttribute('id', ('tb_list_' + serverObj.Id));

        tbl.appendChild(tblHead);
        tbl.appendChild(tblBody);

        tbScroll.appendChild(tbl);
        tbWrapper.appendChild(tbScroll);
        col8.appendChild(tbWrapper);

        row.appendChild(col8);

        wrapper.appendChild(row);
        //attach to host
        document.getElementById('server_tabs').appendChild(wrapper);
        var txtTab = document.createTextNode(serverObj.Servername);
        var li = document.createElement('li');
        var liA = document.createElement('a');
        liA.setAttribute('href', ('#server_' + serverObj.Id));
        liA.appendChild(txtTab);
        li.appendChild(liA);

        document.getElementById('server_tabHost').appendChild(li);
        if(isArma){
            loadHighCharts(("char_server_" + serverObj.Id), parseInt(serverObj.Civilians), parseInt(serverObj.Cops), parseInt(serverObj.Medics), parseInt(serverObj.Adac));
        }

        var args = {
            message: 'get-server-player',
            serverId: serverObj.Id
        };
        ipcRenderer.send('message-to-webwin', args);
    };
}

function joinSteamServer(serverIp, serverPort, serverPw) {
    shell.openExternal('steam://connect/' + serverIp + ':' + serverPort + '/' + ServerPassword);
}

function joinArmaServer(serverIp, serverPort, serverPw, serverParams) {

    storage.get('settings', function(error, data) {
        var params = [];

        path = data.armapath;
        splash = data.splash;
        intro = data.intro;
        ht = data.ht;
        windowed = data.windowed;
        mem = data.mem;
        cpu = data.cpu;
        vram = data.vram;
        thread = data.thread;
        add_params = data.add_params;

        params.push('-noLauncher');
        params.push('-useBE');
        params.push('-connect=' + serverIp);
        params.push('-port=' + serverPort);
        params.push('-mod=' + serverParams);
        params.push('-password=' + serverPw);

        if (splash == true) {
            params.push('-nosplash');
        };
        if (intro == true) {
            params.push('-skipIntro');
        };
        if (ht == true) {
            params.push('-enableHT');
        };
        if (windowed == true) {
            params.push('-window');
        };

        if (mem != null && mem != "") {
            params.push('-maxMem=' + mem);
        };
        if (vram != null && vram != "") {
            params.push('-maxVRAM=' + vram);
        };
        if (cpu != null && cpu != "") {
            params.push('-cpuCount=' + cpu);
        };
        if (thread != null && thread != "") {
            params.push('-exThreads=' + thread);
        };
        if (add_params != null && add_params != "") {
            params.push(add_params);
        };


        var child_process = require('child_process');
        child_process.spawn((armaPath + "\\arma3launcher.exe"), params, [])
    });

}

function setPlayerList(serverId, playerList) {
    var tBody = document.getElementById('tb_list_' + serverId);
    for (i = 0; i < playerList.length; i++) {

        var tbRow = document.createElement('tr');
        var tbCol = document.createElement('td');
        var txtCol = document.createTextNode(playerList[i]);

        tbCol.appendChild(txtCol);
        tbRow.appendChild(tbCol);
        tBody.appendChild(tbRow);
    }
}

function loadHighCharts(chart, civ, cop, med, adac) {
    var Highcharts = require('highcharts');
    $(function() {
        $('#' + chart).highcharts({
            chart: {
                plotBackgroundColor: '#999999',
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie',
                backgroundColor: '#999999'
            },
            title: {
                text: false
            },
            yAxis: {
                title: {
                    text: false
                }
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.y}</b>'
            },
            credits: {
                enabled: false
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    borderWidth: 0,
                    dataLabels: {
                        enabled: false
                    }
                },
                borderWidth: 0
            },
            series: [{
                name: 'Spieler',
                colorByPoint: true,
                data: [{
                    name: 'Zivilisten',
                    y: civ
                }, {
                    name: 'Cops',
                    y: cop,
                }, {
                    name: 'Medics',
                    y: med
                }, {
                    name: 'ADAC',
                    y: adac
                }]
            }],
            colors: ['#8B008B', '#0000CD', '#228B22', '#C00100']
        });
    });
}

function tab_click(tab) {
    return true;
}
