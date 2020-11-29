document.addEventListener("DOMContentLoaded", function(event) {
    var peer_id;
    var username;
    var conn;

    var peer = new Peer({
        host: "/",
        port: 9000,
        path: '/peerjs',
    });

    peer.on('open', function () {
        document.getElementById("peer-id-label").innerHTML = peer.id;
    });

    peer.on('connection', function (connection) {
        conn = connection;
        peer_id = connection.peer;

        conn.on('data', handleMessage);

        document.getElementById("opt").style.display = "none";
    });

    peer.on('call', function (call) {
            call.answer(window.localStream);

            call.on('stream', function (stream) {
                window.peer_stream = stream;
                onReceiveStream(stream, 'peer-camera');
            });

            call.on('close', function(){
                alert("The videocall has finished");
            });
    });
  function requestLocalVideo(callbacks) {
        // Monkeypatch for crossbrowser geusermedia
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

        // Request audio an video
        navigator.getUserMedia({ audio: false, video: true }, callbacks.success , callbacks.error);
    }

    function onReceiveStream(stream, element_id) {
        var video = document.getElementById(element_id);
        video.srcObject = stream;

        window.peer_stream = stream;
    }

    function handleMessage(data) {
        var orientation = "text-left";

        if(data.from == username){
            orientation = "text-right"
        }

        var messageHTML =  '<a href="javascript:void(0);" class="list-group-item' + orientation + '">';
                messageHTML += '<h4 class="list-group-item-heading">'+ data.from +'</h4>';
                messageHTML += '<p class="list-group-item-text">'+ data.text +'</p>';
            messageHTML += '</a>';

        document.getElementById("messages").innerHTML += messageHTML;
    }

    document.getElementById("send-message").addEventListener("click", function(){
        var text = document.getElementById("message").value;

        var data = {
            from: username,
            text: text
        };

        conn.send(data);

        handleMessage(data);

        document.getElementById("message").value = "";
    }, false);

    document.getElementById("call").addEventListener("click", function(){
        console.log('Calling to ' + peer_id);
        console.log(peer);
       
        var call = peer.call(peer_id, window.localStream);

        call.on('stream', function (stream) {
            window.peer_stream = stream;

            onReceiveStream(stream, 'peer-camera');
        });
    }, false);

    document.getElementById("connect-to-peer-btn").addEventListener("click", function(){
        username = document.getElementById("name").value;
        peer_id = document.getElementById("peer_id").value;

        if (peer_id) {
            conn = peer.connect(peer_id, {
                metadata: {
                    'username': username
                }
            });

            conn.on('data', handleMessage);
            document.getElementById("opt").style.display = "none";
        }else{
            alert("You need to provide a peer to connect with !");
            return false;
        }

        document.getElementById("chat").className = "";
        document.getElementById("connection-form").className += " hidden";
    }, false);
    requestLocalVideo({
        success: function(stream){
            window.localStream = stream;
            onReceiveStream(stream, 'my-camera');
        },
        error: function(err){
            alert("Cannot get access to your camera and video !");
            console.error(err);
        }
    });
}, false);
